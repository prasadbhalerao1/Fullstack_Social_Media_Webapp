import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Camera, Heart, MessageCircle, Loader2, Send } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar.jsx";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import FollowButton from "@/components/common/FollowButton.jsx";
import EditProfileModal from "@/components/common/EditProfileModal.jsx";
import PostDetailsModal from "@/components/posts/PostDetailsModal.jsx";
import { getProfileById, updateProfileImage } from "@/redux/slices/userSlice.js";
import { getAllPosts } from "@/redux/slices/postSlice.js";
import { getOrCreateConversation } from "@/redux/slices/messageSlice.js";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { user: currentUser, selectedUser, loading } = useSelector((state) => state.user);
  const { posts: allPosts } = useSelector((state) => state.posts);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [dmLoading, setDmLoading] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    if (id) {
      dispatch(getProfileById(id));
    }
  }, [id, dispatch]); // reload when target user id changes

  // Verify current user vs viewed profile data on mount/change
  useEffect(() => {
    console.log("Profile Component Mounting/Loaded Social Graph:", {
      currentUser: currentUser ? currentUser._id : null,
      currentUsername: currentUser ? currentUser.username : null,
      profileId: id,
      profileUser: selectedUser ? selectedUser._id : null,
      profileUsername: selectedUser ? selectedUser.username : null,
      isOwnProfile
    });
  }, [currentUser, selectedUser, id, isOwnProfile]);

  // Fetch all posts to keep the modal details in sync when comments/likes are toggled
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  // Find the most updated post object from the Redux store for the details modal
  const currentModalPost = allPosts.find((p) => p._id === activeModalPost?._id) || activeModalPost;

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      await dispatch(updateProfileImage(formData));
      if (id) dispatch(getProfileById(id)); // refresh profile
    } catch (err) {
      console.error(err);
    } finally {
      setImageUploading(false);
    }
  };

  const handleMessageUser = async () => {
    if (!selectedUser?._id) return;
    setDmLoading(true);
    const conv = await dispatch(getOrCreateConversation(selectedUser._id));
    setDmLoading(false);
    if (conv) navigate("/chats");
  };

  if (loading && !selectedUser) {
    return (
      <div className="bg-black flex text-white min-h-screen">
        <Sidebar />
        <main className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-white w-10 h-10" />
        </main>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="bg-black flex text-white min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-center items-center gap-4">
          <p className="text-neutral-400 text-sm">User profile not found.</p>
          <Link to="/" className="text-blue-500 font-semibold text-sm hover:underline">
            Go back home
          </Link>
        </main>
      </div>
    );
  }

  const posts = selectedUser?.posts || [];

  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-8 md:py-12 md:px-8 max-w-4xl mx-auto font-sans select-none">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 border-b border-white/10 pb-10 items-center md:items-start">
          
          {/* Avatar Container */}
          <div className="relative group shrink-0">
            <div
              onClick={handleAvatarClick}
              className={`w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden p-0.5 border-2 border-neutral-800 ${
                isOwnProfile ? "cursor-pointer hover:border-neutral-600 transition" : ""
              }`}
            >
              <ProfileImage
                user={selectedUser}
                className="w-full h-full object-cover"
                showOnlineStatus={false}
                linkable={false}
              />
            </div>

            {/* Hover overlay for owner profile upload */}
            {isOwnProfile && (
              <div
                onClick={handleAvatarClick}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                {imageUploading ? (
                  <Loader2 className="animate-spin text-white w-6 h-6" />
                ) : (
                  <Camera size={24} className="text-white" />
                )}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Profile Description */}
          <div className="flex flex-col gap-6 w-full text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <h1 className="text-xl font-bold tracking-wide">{selectedUser.username}</h1>
              
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-white rounded-lg text-sm font-semibold tracking-wide transition cursor-pointer"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <FollowButton targetId={selectedUser._id} currentUser={currentUser} />
                  <button
                    onClick={handleMessageUser}
                    disabled={dmLoading}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-white rounded-lg text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    {dmLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Message
                  </button>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="flex gap-8 justify-center md:justify-start text-sm">
              <div>
                <span className="font-bold text-white mr-1">{posts.length}</span>
                <span className="text-neutral-400">posts</span>
              </div>
              <div>
                <span className="font-bold text-white mr-1">
                  {selectedUser.followers?.length || 0}
                </span>
                <span className="text-neutral-400">followers</span>
              </div>
              <div>
                <span className="font-bold text-white mr-1">
                  {selectedUser.following?.length || 0}
                </span>
                <span className="text-neutral-400">following</span>
              </div>
            </div>

            {/* Bio section */}
            {selectedUser.bio && (
              <div className="text-sm leading-relaxed max-w-md">
                <span className="font-semibold text-neutral-200 capitalize tracking-wide block mb-1">
                  Biography
                </span>
                <p className="text-neutral-300 font-medium whitespace-pre-wrap">
                  {selectedUser.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Posts Grid */}
        <div className="mt-8">
          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => setActiveModalPost(post)}
                  className="relative aspect-square bg-neutral-950 overflow-hidden cursor-pointer group rounded-md border border-white/5"
                >
                  {post.mediaType === "image" ? (
                    <img
                      src={post.mediaUrl}
                      alt="User Post"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={post.mediaUrl}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      muted
                      playsInline
                    />
                  )}

                  {/* Likes/Comments Hover Overlay */}
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-6 text-white font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Heart size={20} className="fill-white text-white" />
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle size={20} className="fill-white text-white" />
                      <span>{post.comment?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-500 text-sm">
              No posts shared yet.
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Active Post Details Modal */}
      {activeModalPost && (
        <PostDetailsModal
          isOpen={!!activeModalPost}
          onClose={() => setActiveModalPost(null)}
          post={currentModalPost}
          currentUser={currentUser}
          onDelete={() => {
            if (id) dispatch(getProfileById(id)); // refresh profile posts list
          }}
        />
      )}
    </div>
  );
};

export default Profile;