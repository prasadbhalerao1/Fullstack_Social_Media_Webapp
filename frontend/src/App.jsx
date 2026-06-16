import "./App.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Home from "@/pages/Home.jsx";
import Profile from "@/pages/Profile.jsx";
import Login from "@/pages/Login.jsx";
import Explore from "@/pages/Explore.jsx";
import Reels from "@/pages/Reels.jsx";
import Message from "@/pages/Message.jsx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "./redux/slices/userSlice.js";
import { SocketProvider } from "@/context/SocketContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="bg-black flex text-white min-h-screen justify-center items-center">
        <Loader2 className="animate-spin text-white w-10 h-10" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const router = createBrowserRouter([
    { path: "/", element: <ProtectedRoute><Home /></ProtectedRoute> },
    { path: "/explore", element: <ProtectedRoute><Explore /></ProtectedRoute> },
    { path: "/reels", element: <ProtectedRoute><Reels /></ProtectedRoute> },
    { path: "/chats", element: <ProtectedRoute><Message /></ProtectedRoute> },
    { path: "/profile/:id", element: <ProtectedRoute><Profile /></ProtectedRoute> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Login /> },
    { path: "/register", element: <Login /> },
  ]);

  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  );
}

export default App;
