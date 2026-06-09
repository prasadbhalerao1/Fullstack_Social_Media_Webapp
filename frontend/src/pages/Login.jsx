const logo = "/logo.png";
import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useSearchParams } from "react-router-dom";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState("login");
  const [error, setError] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    newPassword: "",
  });

  const token = searchParams.get("token") || "";

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
      console.log("register", formData);
      return;
    }

    if (view === "login") {
      console.log("login", formData);
      return;
    }

    if (view === "forgotPassword") {
      console.log("forgotPassword", formData);
      return;
    }

    if (view === "passwordChange") {
      console.log("passwordChange", formData);
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
    <div className="min-h-screen bg-black/95 px-4 py-6 text-white sm:px-6 flex items-center justify-center font-sans">
      <div className="relative flex w-full max-w-5xl min-h-[620px] flex-col overflow-hidden rounded-3xl bg-white/5 shadow-2xl backdrop-blur-xl md:flex-row">
        {/* Left Section */}
        <div className="hidden md:flex md:w-1/2 p-8 items-center justify-center">
          <div className="flex h-full w-full items-center justify-center rounded-3xl bg-neutral-900/80 ring-1 ring-white/5 px-10 py-12 text-center shadow-lg">
            <div className="max-w-lg">
              <div className="mx-auto mb-6 w-56 md:w-64 lg:w-72">
                <img src={logo} className="w-full" alt="Logo" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                RUNTIME
              </h1>
              <p className="text-lg md:text-xl font-light text-white/85">
                Code . Connect . Collab
              </p>
            </div>
          </div>
        </div>

        {/* right section */}
        <div className="flex w-full items-center justify-center p-6 md:w-1/2 md:p-10">
          <AuthForm
            view={view}
            formData={formData}
            error={error}
            token={token}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            switchView={switchView}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
