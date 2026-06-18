import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Modal from "@/components/common/Modal.jsx";
import { deletePostById } from "@/redux/slices/postSlice.js";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import FollowButton from "@/components/common/FollowButton.jsx";
import MediaIcons from "@/components/common/MediaIcons.jsx";
import CommentForm from "@/components/common/CommentForm.jsx";
import Media from "@/components/common/Media.jsx";
import CommentSection from "@/components/common/CommentSection.jsx";
import { timeAgo } from "@/lib/timeAgo.js";

const PostDetailsModal = ({ post, currentUser, isOpen, onClose, onDelete }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  const isOwner = currentUser?._id === post?.user?._id;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePostById(post?._id));
      if (onDelete) {
        onDelete(post?._id);
      }
      onClose();
    }
  };

  // Play/Pause Video Click
  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setShowPlayIcon(true);
          })
          .catch((err) => console.log(err));
      } else {
        setIsPlaying(true);
        setShowPlayIcon(true);
      }
    }
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // Autoplay video when modal opens, and pause when closed
  useEffect(() => {
    if (videoRef.current) {
      if (isOpen) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
        } else {
          setIsPlaying(true);
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isOpen, isMuted]);

  if (!post) return null;

  return (
    <Modal
      openModal={isOpen}
      onClose={onClose}
      initialWidth="max-w-5xl"
      initialHeight="h-[92vh] md:h-[80vh]"
      className="md:flex-row rounded-lg overflow-hidden border border-neutral-800"
    >
      <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto md:overflow-hidden no-scrollbar">
        {/* Left Side: Media */}
        <Media
          item={post}
          videoRef={videoRef}
          isPlaying={isPlaying}
          isMuted={isMuted}
          showPlayIcon={showPlayIcon}
          handleVideoClick={handleVideoClick}
          handleMuteToggle={handleMuteToggle}
          containerClassName="w-full h-auto aspect-square flex-none md:aspect-auto md:flex-1 md:h-full"
          mediaClassName="w-full h-full object-contain"
        />

        {/* Right Side: Details */}
        <div className="w-full md:w-87.5 flex flex-col bg-black md:border-l border-white/10 flex-none md:flex-1 md:h-full md:overflow-hidden overflow-visible">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <ProfileImage
                user={post?.user}
                className="w-8 h-8"
                showOnlineStatus={false}
              />
              <Link
                to={`/profile/${post?.user?._id}`}
                className="font-semibold text-sm text-white hover:underline"
              >
                {post?.user?.username}
              </Link>
              {!isOwner && (
                <FollowButton
                  targetId={post?.user?._id}
                  currentUser={currentUser}
                />
              )}
            </div>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="p-1 text-neutral-500 hover:text-red-500 transition cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="flex-none md:flex-1 md:overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4 overflow-visible">
            {/* Caption (Treat as first comment) */}
            {post?.caption && (
              <div className="flex gap-3">
                <ProfileImage
                  user={post?.user}
                  className="w-8 h-8 shrink-0"
                  showOnlineStatus={false}
                />
                <div className="flex flex-col">
                  <span className="text-sm">
                    <Link
                      to={`/profile/${post?.user?._id}`}
                      className="font-semibold text-white hover:underline mr-2"
                    >
                      {post?.user?.username}
                    </Link>
                    <span className="text-white font-thin">
                      {post.caption}
                    </span>
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">
                    {timeAgo(post?.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Comments List */}
            <CommentSection
              comments={post?.comment}
              fallbackText={!post?.caption ? "No comments yet." : ""}
            />
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-white/10 flex flex-col gap-1">
            <MediaIcons
              type="post"
              item={post}
              size={24}
              handleOpenModal={() =>
                document.getElementById(`comment-input-${post._id}`)?.focus()
              }
            />
            <div className="px-4 pb-3 flex flex-col gap-1">
              {post?.likes?.length > 0 && (
                <div className="font-semibold text-sm text-white">
                  {post.likes.length}{" "}
                  {post.likes.length === 1 ? "like" : "likes"}
                </div>
              )}
              <span className="text-[10px] text-neutral-500 uppercase font-medium">
                {timeAgo(post?.createdAt)}
              </span>
            </div>
          </div>

          {/* Comment Input */}
          <div className="border-t border-white/10 px-4 py-3">
            <CommentForm
              postId={post?._id}
              inputId={`comment-input-${post._id}`}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailsModal;
