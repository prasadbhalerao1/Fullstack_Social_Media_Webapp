import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ProfileImage = ({
  user,
  username = false,
  className = "w-8 h-8",
  showOnlineStatus = true,
  linkable = true,
}) => {
  const { user: currentUser } = useSelector((state) => state.user);

  // Hardcoded to true for demo online indicator as requested, excluding self
  const isOnline = true;

  const initials = user?.username ? user.username.charAt(0).toUpperCase() : "?";

  // Determine monogram text size based on container size
  let textClass = "text-xs";
  if (
    className.includes("w-14") ||
    className.includes("h-14") ||
    className.includes("w-16") ||
    className.includes("h-16")
  ) {
    textClass = "text-lg";
  } else if (
    className.includes("w-10") ||
    className.includes("h-10") ||
    className.includes("w-12") ||
    className.includes("h-12")
  ) {
    textClass = "text-sm";
  }

  // The actual circular avatar structure
  const avatarCircle = (
    <div className="w-full h-full rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center bg-neutral-800">
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt={user?.username || "profile"}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className={`${textClass} text-white font-bold select-none`}>
          {initials}
        </span>
      )}
    </div>
  );

  // The wrapper that holds the avatar circle and the status badge
  const avatarWrapper = (
    <div className={`relative ${className} shrink-0`}>
      {linkable && user?._id ? (
        <Link to={`/profile/${user._id}`} className="block w-full h-full">
          {avatarCircle}
        </Link>
      ) : (
        avatarCircle
      )}
      {isOnline &&
        showOnlineStatus &&
        user?._id &&
        currentUser?._id &&
        user._id !== currentUser._id && (
          <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border border-black bg-green-500 shadow-md"></span>
        )}
    </div>
  );

  if (!username) {
    return avatarWrapper;
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      {avatarWrapper}
      {user?._id &&
        (linkable ? (
          <Link
            to={`/profile/${user._id}`}
            className="text-xs font-semibold text-neutral-200 hover:text-white transition duration-200"
          >
            {user.username}
          </Link>
        ) : (
          <span className="text-xs font-semibold text-neutral-200">
            {user.username}
          </span>
        ))}
    </div>
  );
};

export default ProfileImage;
