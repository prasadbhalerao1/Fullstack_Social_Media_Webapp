import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";
import Modal from "@/components/common/Modal.jsx";
import { updateUserProfile } from "@/redux/slices/userSlice.js";

const EditProfileModal = ({ isOpen, onClose, currentUser }) => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setBio(currentUser.bio || "");
    }
  }, [currentUser, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSubmitting(true);
    dispatch(
      updateUserProfile({ username: username.trim(), bio: bio.trim() }, () => {
        setIsSubmitting(false);
        onClose();
      })
    ).catch(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <Modal
      openModal={isOpen}
      onClose={onClose}
      showCloseButton={false}
      initialWidth="max-w-md"
      initialHeight="h-auto"
    >
      <div className="p-6 text-white bg-neutral-950 font-sans flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 outline-none text-white text-sm focus:border-white focus:ring-1 focus:ring-white transition"
              required
            />
          </div>

          {/* Biography */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 outline-none text-white text-sm focus:border-white focus:ring-1 focus:ring-white transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-neutral-700 hover:bg-white/5 text-sm font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="px-6 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
