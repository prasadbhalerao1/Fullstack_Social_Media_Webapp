const logo = "/logo.png";
import { useState, useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm.jsx";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, loginUser, forgotPassword, passwordChange } from "../redux/slices/userSlice.js";

const DEMO_EMAIL = "test@example.com";
const DEMO_PASSWORD = "mypassword";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [view, setView] = useState("login");
  const [error, setError] = useState({});

  useEffect(() => {
    if (token) {
      setView("passwordChange");
    } else {
      const urlView = searchParams.get("view");
      if (urlView === "register" || urlView === "signup") {
        setView("register");
      } else {
        setView("login");
      }
    }
  }, [searchParams, token]);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (view === "login") {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      }
    }

    if (view === "register") {
      if (!formData.username) {
        newErrors.username = "Username is required";
      } else if (/\s/.test(formData.username)) {
        newErrors.username = "Username cannot contain spaces";
      }

      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (view === "forgotPassword") {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }
    }

    if (view === "passwordChange") {
      if (!token) {
        newErrors.token = "Invalid or expired token";
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your new password";
      } else if (formData.confirmPassword !== formData.newPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error[name]) {
      setError({
        ...error,
        [name]: "",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (view === "register") {
      dispatch(
        registerUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      );
    }

    if (view === "login") {
      dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        }),
      );
    }

    if (view === "forgotPassword") {
      dispatch(
        forgotPassword({ email: formData.email }, () => switchView("login"))
      );
    }

    if (view === "passwordChange") {
      dispatch(
        passwordChange(
          { token, newPassword: formData.newPassword },
          () => {
            navigate("/login");
            switchView("login");
          }
        )
      );
    }

    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      newPassword: "",
    });
  };

  const handleDemoLogin = () => {
    dispatch(
      loginUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
    );
  };

  const switchView = (newView) => {
    setView(newView);
    setError({});
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      newPassword: "",
    });
  };

  return (
    <div className="relative min-h-screen bg-black px-4 py-6 text-white sm:px-6 flex items-center justify-center font-sans overflow-hidden">
      {/* Ambient radial lighting overlays */}
      <div className="absolute inset-0 radial-glow-cyan pointer-events-none z-0 opacity-20" />
      <div className="absolute inset-0 radial-glow-emerald pointer-events-none z-0 opacity-20" />

      {/* Grid background structure with fade mask */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] grid-mask"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative z-10 flex w-full max-w-5xl min-h-[620px] flex-col overflow-hidden rounded-3xl bg-neutral-950/45 border border-white/5 shadow-2xl backdrop-blur-xl md:flex-row">
        {/* Left Section */}
        <div className="hidden md:flex md:w-1/2 p-8 items-center justify-center relative z-10">
          <div className="flex h-full w-full items-center justify-center rounded-3xl bg-[#080808]/85 ring-1 ring-white/5 px-10 py-12 text-center shadow-lg">
            <div className="max-w-lg">
              <div className="mx-auto mb-6 w-56 md:w-64 lg:w-72">
                <img src={logo} className="w-full" alt="Logo" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-wider">
                RUNTIME
              </h1>
              <p className="text-lg md:text-xl font-light text-neutral-400">
                Code <span className="text-neutral-600 font-mono">·</span> Connect <span className="text-neutral-600 font-mono">·</span> Collab
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex w-full items-center justify-center p-6 md:w-1/2 md:p-10 relative z-10">
          <AuthForm
            view={view}
            formData={formData}
            error={error}
            token={token}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            switchView={switchView}
            handleDemoLogin={handleDemoLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
