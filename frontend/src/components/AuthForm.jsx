import { Mail, User, Lock } from "lucide-react";

const AuthForm = ({
  view,
  formData,
  error,
  token,
  handleChange,
  handleSubmit,
  switchView,
}) => {
  const renderLoginForm = () => (
    <>
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        Welcome Back
      </h2>
      <p className="text-gray-300 mb-8 text-center">
        Sign in to your account to continue
      </p>

      {/* Email */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Mail size={20} />
          </span>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ${error.email ? "border-red-500" : "border-gray-700"}`}
          />
        </div>
        <p className="text-red-500 text-xs mt-1 ml-1 h-4">
          {error.email || " "}
        </p>
      </div>

      {/*Password */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Mail size={20} />
          </span>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ${error.password ? "border-red-500" : "border-gray-700"}`}
          />
        </div>
        <p className="text-red-500 text-xs mt-1 ml-1 h-4">
          {error.password || " "}
        </p>
      </div>

      <div className="flex justify-end mt-3 mb-6">
        <button
          type="button"
          onClick={() => switchView("forgotPassword")}
          className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition duration-300 focus:outline-none"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Login
      </button>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <span>Don't have an account?</span>
        <button
          type="button"
          onClick={() => switchView("register")}
          className="ml-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition duration-200 focus:outline-none"
        >
          Register
        </button>
      </div>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <div className="flex items-center justify-start mb-4">
        <button
          type="button"
          onClick={() => switchView("login")}
          className="mr-4 text-gray-400 hover:text-white"
        >
          ←
        </button>
        <h2 className="text-3xl font-bold mb-0 text-white">
          Create an Account
        </h2>
      </div>
      <p className="text-gray-300 mb-6">
        Join our community and connect with people.
      </p>

      {/* Username */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <User size={18} />
          </span>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username || ""}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ${error.username ? "border-red-500" : "border-gray-700"}`}
          />
        </div>
        <p className="text-red-500 text-xs mt-1 ml-1 h-4">
          {error.username || " "}
        </p>
      </div>

      {/* Email */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Mail size={18} />
          </span>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ${error.email ? "border-red-500" : "border-gray-700"}`}
          />
        </div>
        <p className="text-red-500 text-xs mt-1 ml-1 h-4">
          {error.email || " "}
        </p>
      </div>

      {/* Password */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Lock size={18} />
          </span>
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ${error.password ? "border-red-500" : "border-gray-700"}`}
          />
        </div>
        <p className="text-red-500 text-xs mt-1 ml-1 h-4">
          {error.password || " "}
        </p>
      </div>

      {/* Confirm Password */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Lock size={18} />
          </span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ${error.confirmPassword ? "border-red-500" : "border-gray-700"}`}
          />
        </div>
        <p className="text-red-500 text-xs mt-1 ml-1 h-4">
          {error.confirmPassword || " "}
        </p>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition duration-300"
      >
        Register
      </button>

      <div className="mt-6 text-center text-gray-400 text-sm">
        <span>Already have an account?</span>
        <button
          type="button"
          onClick={() => switchView("login")}
          className="ml-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
        >
          Log in
        </button>
      </div>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <div className="flex items-center justify-start mb-4">
        <button
          type="button"
          onClick={() => switchView("login")}
          className="mr-4 text-gray-400 hover:text-white"
        >
          ←
        </button>
        <h2 className="text-3xl font-bold mb-0 text-white">Forgot Password</h2>
      </div>
      <p className="text-gray-300 mb-6">
        Enter your email to receive reset instructions.
      </p>
      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Mail size={18} />
          </span>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ${error.email ? "border-red-500" : "border-gray-700"}`}
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition duration-300"
      >
        Send Reset Link
      </button>
    </>
  );

  const renderPasswordChangeForm = () => (
    <>
      <div className="flex items-center justify-start mb-4">
        <button
          type="button"
          onClick={() => switchView("login")}
          className="mr-4 text-gray-400 hover:text-white"
        >
          ←
        </button>
        <h2 className="text-3xl font-bold mb-0 text-white">Password Change</h2>
      </div>
      <p className="text-gray-300 mb-6">
        Enter your new password twice to confirm.
      </p>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Lock size={18} />
          </span>
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword || ""}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ${error.newPassword ? "border-red-500" : "border-gray-700"}`}
          />
        </div>
        <p className="text-red-500 text-xs mt-1 ml-1 h-4">
          {error.newPassword || " "}
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Lock size={18} />
          </span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword || ""}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ${error.confirmPassword ? "border-red-500" : "border-gray-700"}`}
          />
        </div>
        <p className="text-red-500 text-xs mt-1 ml-1 h-4">
          {error.confirmPassword || " "}
        </p>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition duration-300"
      >
        Change Password
      </button>
    </>
  );

  const renderTokenError = () => (
    <>
      <h2 className="text-3xl font-bold mb-4 text-center text-white">
        Invalid or Expired Link
      </h2>
      <p className="text-gray-300 mb-8 text-center">
        This password reset link is invalid or has expired.
      </p>

      <button
        type="button"
        onClick={() => switchView("forgotPassword")}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition duration-300"
      >
        Request new Reset Link
      </button>

      <button
        type="button"
        onClick={() => switchView("login")}
        className="w-full mt-3 py-3 rounded-xl border border-gray-700 bg-transparent text-white font-semibold hover:bg-white/5 transition duration-300"
      >
        Back to Login
      </button>
    </>
  );

  const renderForm = () => {
    switch (view) {
      case "register":
        return renderRegisterForm();
      case "forgotPassword":
        return renderForgotPasswordForm();
      case "passwordChange":
        return token ? renderPasswordChangeForm() : renderTokenError();
      case "login":
      default:
        return renderLoginForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      {renderForm()}
    </form>
  );
};

export default AuthForm;
