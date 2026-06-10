import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Home,
  Search,
  Film,
  MessageCircle,
  User,
  LogOut,
  Bell,
  Plus,
} from "lucide-react";
import { logoutUser } from "../redux/slices/userSlice";

const logo = "/logo.png";
const logo_2 = "/favicon.svg";

const Sidebar = () => {
  const { user: currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [active, setActive] = useState("home");

  const navItems = [
    { id: "home", name: "Home", icon: <Home size={20} />, path: "/" },
    {
      id: "explore",
      name: "Explore",
      icon: <Search size={20} />,
      path: "/explore",
    },
    { id: "reels", name: "Reels", icon: <Film size={20} />, path: "/reels" },
    {
      id: "messages",
      name: "Messages",
      icon: <MessageCircle size={20} />,
      path: "/chats",
    },
    {
      id: "profile",
      name: "Profile",
      icon: <User size={20} />,
      path: `/profile/${currentUser?._id}`,
    },
    { id: "logout", name: "Logout", icon: <LogOut size={20} /> },
    { id: "notifications", name: "Notifications", icon: <Bell size={20} /> },
  ];

  const handleOpenModal = (type) => {
    console.log("Open Modal:", type);
  };

  const handleOpenModel = () => {
    handleOpenModal("post");
  };

  // Determine active item based on current URL path
  const isActive = (item) => {
    if (item.path) {
      if (item.path === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(item.path);
    }
    return active === item.id;
  };

  return (
    <aside className="sticky top-0 left-0 h-screen z-50 w-20 md:w-64 p-4 flex flex-col gap-6 border-r border-white/10 backdrop-blur-xl bg-black rounded-tr-3xl rounded-br-3xl shadow-2xl">
      {/* Logo Section */}
      <div className="px-2 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo_2} alt="logo" className="w-8 h-8 object-contain" />
          <span className="hidden md:block text-2xl font-black tracking-wider text-white">
            RUNTIME
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems?.map((item) => {
          const isItemActive = isActive(item);
          const activeClass = isItemActive
            ? "bg-white/10 text-white font-semibold shadow-sm"
            : "text-white/75 hover:bg-white/5 hover:text-white";

          if (item.id === "logout") {
            return (
              <button
                key={item.id}
                onClick={() => dispatch(logoutUser(navigate))}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 text-red-400 hover:bg-red-500/10 cursor-pointer justify-center md:justify-start"
              >
                {item.icon}
                <span className="hidden md:inline font-medium">
                  {item.name}
                </span>
              </button>
            );
          }

          if (item.path) {
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 cursor-pointer justify-center md:justify-start ${activeClass}`}
              >
                {item.icon}
                <span className="hidden md:inline font-medium">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 cursor-pointer justify-center md:justify-start ${activeClass}`}
            >
              {item.icon}
              <span className="hidden md:inline font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Create Button Section */}
      <div className="mt-auto px-2 pb-4">
        <button
          onClick={() => handleOpenModal("post")}
          className="flex items-center justify-center gap-2 w-full p-3 md:py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all duration-300 cursor-pointer"
        >
          <Plus size={20} />
          <span className="hidden md:inline font-medium">Create</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
