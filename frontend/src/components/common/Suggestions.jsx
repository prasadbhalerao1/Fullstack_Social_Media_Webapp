import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { getSuggestedUsers } from "@/redux/slices/userSlice.js";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import FollowButton from "@/components/common/FollowButton.jsx";

const Suggestions = ({ isDarkTheme = true }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user: currentUser } = useSelector((state) => state.user);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(getSuggestedUsers()).then((users) => {
      setSuggestedUsers(users || []);
      setLoading(false);
    });
  }, [dispatch]);

  // Hide suggested users sidebar on pages where it is not relevant
  const showSidebar = ["/"].includes(location.pathname);
  if (!showSidebar) return null;

  if (loading) {
    return (
      <div className="w-full py-4 text-center text-xs text-neutral-500">
        Loading suggestions...
      </div>
    );
  }

  const textColor = isDarkTheme ? "text-white" : "text-black";
  const subTextColor = isDarkTheme ? "text-neutral-400" : "text-neutral-600";
  const linkColor = isDarkTheme
    ? "text-white hover:text-neutral-400"
    : "text-neutral-800 hover:text-neutral-500";

  return (
    <div className="w-full flex flex-col gap-4 p-5 select-none font-sans bg-black/40 rounded-2xl border border-white/5">
      {/* Current User Row */}
      {currentUser && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ProfileImage
              user={currentUser}
              className="w-11 h-11"
              showOnlineStatus={false}
            />
            <div className="flex flex-col">
              <Link
                to={`/profile/${currentUser._id}`}
                className={`text-sm font-semibold hover:underline cursor-pointer ${textColor}`}
              >
                {currentUser.username}
              </Link>
              <span className="text-xs text-neutral-500 truncate max-w-[150px]">
                {currentUser.bio || "Runtime User"}
              </span>
            </div>
          </div>
          <Link
            to={`/profile/${currentUser._id}`}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition cursor-pointer"
          >
            Profile
          </Link>
        </div>
      )}

      {/* Suggested Section Header */}
      {suggestedUsers.length > 0 && (
        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm font-bold ${subTextColor}`}>
            Suggested for you
          </span>
          <button
            className={`text-xs font-semibold cursor-pointer ${linkColor}`}
          >
            See All
          </button>
        </div>
      )}

      {/* Suggested Users List */}
      <div className="flex flex-col gap-3.5">
        {suggestedUsers.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <ProfileImage
                user={user}
                className="w-8 h-8"
                showOnlineStatus={false}
              />
              <div className="flex flex-col">
                <Link
                  to={`/profile/${user._id}`}
                  className={`text-sm font-semibold hover:underline cursor-pointer ${textColor}`}
                >
                  {user.username}
                </Link>
                <span className="text-[10px] text-neutral-500 truncate max-w-[120px]">
                  {user.bio || "Recommended for you"}
                </span>
              </div>
            </div>
            <FollowButton targetId={user._id} currentUser={currentUser} />
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-[10px] text-neutral-600 mt-6 leading-relaxed">
        About • Help • Press • API • Jobs • Privacy • Terms • Locations •
        Language
        <p className="mt-4 font-semibold uppercase text-neutral-700">
          © 2026 RUNTIME FROM METADATA
        </p>
      </div>
    </div>
  );
};

export default Suggestions;
