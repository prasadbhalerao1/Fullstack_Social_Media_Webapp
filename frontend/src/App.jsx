import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "@/pages/Home.jsx";
import Profile from "@/pages/Profile.jsx";
import Login from "@/pages/Login.jsx";
import Explore from "@/pages/Explore.jsx";
import Reels from "@/pages/Reels.jsx";
import Message from "@/pages/Message.jsx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./redux/slices/userSlice.js";
import { SocketProvider } from "@/context/SocketContext.jsx";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/explore", element: <Explore /> },
    { path: "/reels", element: <Reels /> },
    { path: "/chats", element: <Message /> },
    { path: "/profile/:id", element: <Profile /> },
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
