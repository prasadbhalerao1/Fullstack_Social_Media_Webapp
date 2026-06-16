import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "@/lib/axios.js";
import toast from "react-hot-toast";

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  hasMoreMessages: true,
  messagesLoading: false,
  conversationsLoading: false,
  typingUsers: {}, // { conversationId: { userId: bool } }
  error: null,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setConversations: (state, { payload }) => {
      state.conversations = payload;
    },

    updateConversationLastMessage: (state, { payload: msg }) => {
      const conv = state.conversations.find(
        (c) => c._id === msg.conversationId?.toString()
      );
      if (conv) {
        conv.lastMessage = msg;
        conv.updatedAt = msg.createdAt;
        state.conversations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      }
    },

    setActiveConversation: (state, { payload }) => {
      state.activeConversation = payload;
      state.messages = [];
      state.hasMoreMessages = true;
    },

    setMessages: (state, { payload: { messages, hasMore } }) => {
      state.messages = messages;
      state.hasMoreMessages = hasMore;
      state.messagesLoading = false;
    },

    // Prepend older messages when scrolling up in chat
    prependMessages: (state, { payload: { messages, hasMore } }) => {
      state.messages = [...messages, ...state.messages];
      state.hasMoreMessages = hasMore;
      state.messagesLoading = false;
    },

    addMessage: (state, { payload: msg }) => {
      const exists = state.messages.some((m) => m._id === msg._id);
      if (!exists) state.messages.push(msg);
    },

    // Optimistic: show message immediately before server confirms
    addPendingMessage: (state, { payload: msg }) => {
      state.messages.push(msg);
    },

    // Replace the optimistic message with the real server response
    confirmMessage: (state, { payload: { tempId, message } }) => {
      const idx = state.messages.findIndex((m) => m.tempId === tempId);
      if (idx !== -1) {
        state.messages[idx] = message;
      } else {
        const exists = state.messages.some((m) => m._id === message._id);
        if (!exists) state.messages.push(message);
      }
    },

    updateMessageStatus: (state, { payload: { messageIds, status } }) => {
      const ids = Array.isArray(messageIds) ? messageIds.map(String) : [String(messageIds)];
      state.messages.forEach((m) => {
        if (ids.includes(String(m._id))) {
          m.status = status;
        }
      });
    },

    bulkUpdateMessageStatus: (state, { payload: updates }) => {
      updates.forEach(({ messageId, status }) => {
        const msg = state.messages.find((m) => String(m._id) === String(messageId));
        if (msg) msg.status = status;
      });
    },

    updateMessageDeleted: (state, { payload: { messageId, deleteFor } }) => {
      const msg = state.messages.find((m) => String(m._id) === String(messageId));
      if (!msg) return;
      if (deleteFor === "everyone") {
        msg.text = "";
        msg.mediaUrl = null;
        msg.mediaType = null;
        msg.deletedForEveryone = true;
      } else {
        msg.deletedForMe = true;
      }
    },

    updateMessageEdited: (state, { payload: { messageId, text, editedAt } }) => {
      const msg = state.messages.find((m) => String(m._id) === String(messageId));
      if (msg) {
        msg.text = text;
        msg.isEdited = true;
        msg.editedAt = editedAt;
      }
    },

    updateMessageReactions: (state, { payload: { messageId, reactions } }) => {
      const msg = state.messages.find((m) => String(m._id) === String(messageId));
      if (msg) msg.reactions = reactions;
    },

    setTyping: (state, { payload: { conversationId, userId, isTyping } }) => {
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = {};
      }
      state.typingUsers[conversationId][userId] = isTyping;
    },

    setMessagesLoading: (state, { payload }) => {
      state.messagesLoading = payload;
    },

    setConversationsLoading: (state, { payload }) => {
      state.conversationsLoading = payload;
    },

    setError: (state, { payload }) => {
      state.error = payload;
    },

    incrementUnread: (state, { payload: conversationId }) => {
      const conv = state.conversations.find(
        (c) => c._id === String(conversationId)
      );
      if (conv) conv.unreadCount = (conv.unreadCount || 0) + 1;
    },

    clearUnread: (state, { payload: conversationId }) => {
      const conv = state.conversations.find(
        (c) => c._id === String(conversationId)
      );
      if (conv) conv.unreadCount = 0;
    },
  },
});

export const {
  setConversations,
  updateConversationLastMessage,
  setActiveConversation,
  setMessages,
  prependMessages,
  addMessage,
  addPendingMessage,
  confirmMessage,
  updateMessageStatus,
  bulkUpdateMessageStatus,
  updateMessageDeleted,
  updateMessageEdited,
  updateMessageReactions,
  setTyping,
  setMessagesLoading,
  setConversationsLoading,
  setError,
  incrementUnread,
  clearUnread,
} = messageSlice.actions;

export default messageSlice.reducer;

// Thunks

export const fetchConversations = () => async (dispatch) => {
  dispatch(setConversationsLoading(true));
  try {
    const { data } = await axiosInstance.get("/message/conversations");
    if (data.success) dispatch(setConversations(data.conversations));
  } catch (err) {
    dispatch(setError(err?.response?.data?.message || err.message));
  } finally {
    dispatch(setConversationsLoading(false));
  }
};

export const fetchMessages =
  (conversationId, cursor = null) =>
  async (dispatch) => {
    dispatch(setMessagesLoading(true));
    try {
      const params = new URLSearchParams({ limit: 30 });
      if (cursor) params.set("cursor", cursor);

      const { data } = await axiosInstance.get(
        `/message/${conversationId}?${params}`
      );
      if (data.success) {
        if (cursor) {
          dispatch(
            prependMessages({ messages: data.messages, hasMore: data.hasMore })
          );
        } else {
          dispatch(
            setMessages({ messages: data.messages, hasMore: data.hasMore })
          );
        }
      }
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message));
      dispatch(setMessagesLoading(false));
    }
  };

export const getOrCreateConversation = (userId) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.post(
      `/message/conversation/${userId}`
    );
    if (data.success) {
      dispatch(setActiveConversation(data.conversation));
      return data.conversation;
    }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to open conversation");
  }
  return null;
};

export const sendMessageThunk =
  (formData, tempId) => async (dispatch) => {
    try {
      const { data } = await axiosInstance.post("/message/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        dispatch(confirmMessage({ tempId, message: data.message }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message");
      dispatch(updateMessageStatus({ messageIds: [tempId], status: "failed" }));
    }
  };
