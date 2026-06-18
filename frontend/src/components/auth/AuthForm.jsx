import { Mail, User, Lock, Zap, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

const AuthForm = ({
  view,
  formData,
  error,
  token,
  handleChange,
  handleSubmit,
  switchView,
  handleDemoLogin,
}) => {
  const { loading } = useSelector((state) => state.user);

  const inputClass = (err) => `
    w-full pl-11 pr-4 py-3 
    font-mono text-sm 
    bg-neutral-950/50 text-white 
    border rounded-xl 
    focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 
    transition-all duration-200 
    ${err ? "border-red-500/40 focus:border-red-500/50 focus:ring-red-500/10" : "border-white/10 hover:border-white/20"}
  `;

  const buttonClass = `
    w-full py-3 rounded-xl 
    bg-white hover:bg-neutral-200 
    text-black font-extrabold text-sm 
    transition-all duration-200 
    shadow-md hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] 
    active:scale-98 cursor-pointer 
    flex items-center justify-center gap-2 
    disabled:opacity-50 disabled:pointer-events-none
  `;

  const renderLoginForm = () => (
    <>
      <h2 className="text-3xl font-extrabold mb-2 text-center text-white tracking-tight">
        Welcome Back
      </h2>
      <p className="text-neutral-400 mb-8 text-center text-sm">
        Sign in to your RUNTIME account to continue
      </p>

      {/* Email */}
      <div className="mb-4">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-1.5 block">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Mail size={18} />
          </span>
          <input
            type="email"
            name="email"
            placeholder="dev@runtime.social"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className={inputClass(error.email)}
          />
        </div>
        <p className="text-red-500 text-[10px] mt-1 ml-1 h-4 font-mono">
          {error.email || " "}
        </p>
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-1.5 block">
          Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Lock size={18} />
          </span>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className={inputClass(error.password)}
          />
        </div>
        <p className="text-red-500 text-[10px] mt-1 ml-1 h-4 font-mono">
          {error.password || " "}
        </p>
      </div>

      <div className="flex justify-end mt-1 mb-6">
        <button
          type="button"
          onClick={() => switchView("forgotPassword")}
          disabled={loading}
          className="text-xs font-semibold text-neutral-400 hover:text-white transition duration-200 focus:outline-none cursor-pointer disabled:opacity-50"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={buttonClass}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
            <span>Establishing Connection...</span>
          </>
        ) : (
          <span>Log In</span>
        )}
      </button>

      {/* Demo Login Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0b0b0b] px-3 text-neutral-600 tracking-widest uppercase text-[9px] font-mono">or</span>
        </div>
      </div>

      {/* Demo Login Button */}
      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white font-medium text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Zap size={13} className="text-amber-400 fill-amber-400/20 animate-pulse" />
        <span>Continue as Demo User</span>
      </button>
      <p className="text-center text-neutral-700 text-[9px] mt-2 font-mono">
        test@example.com · mypassword
      </p>

      <div className="mt-8 text-center text-neutral-500 text-xs">
        <span>Don't have an account?</span>
        <button
          type="button"
          onClick={() => switchView("register")}
          disabled={loading}
          className="ml-1.5 font-bold text-white hover:underline transition duration-200 focus:outline-none cursor-pointer disabled:opacity-50"
        >
          Register
        </button>
      </div>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <div className="flex items-center justify-start mb-2">
        <button
          type="button"
          onClick={() => switchView("login")}
          disabled={loading}
          className="mr-3 p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 cursor-pointer transition disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Create Account
        </h2>
      </div>
      <p className="text-neutral-400 mb-8 text-sm">
        Join our developer community and connect with peers.
      </p>

      {/* Username */}
      <div className="mb-4">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-1.5 block">
          Username
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <User size={18} />
          </span>
          <input
            type="text"
            name="username"
            placeholder="octocat"
            value={formData.username || ""}
            onChange={handleChange}
            disabled={loading}
            className={inputClass(error.username)}
          />
        </div>
        <p className="text-red-500 text-[10px] mt-1 ml-1 h-4 font-mono">
          {error.username || " "}
        </p>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-1.5 block">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Mail size={18} />
          </span>
          <input
            type="email"
            name="email"
            placeholder="dev@runtime.social"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className={inputClass(error.email)}
          />
        </div>
        <p className="text-red-500 text-[10px] mt-1 ml-1 h-4 font-mono">
          {error.email || " "}
        </p>
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-1.5 block">
          Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Lock size={18} />
          </span>
          <input
            type="password"
            name="password"
            placeholder="min. 6 characters"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className={inputClass(error.password)}
          />
        </div>
        <p className="text-red-500 text-[10px] mt-1 ml-1 h-4 font-mono">
          {error.password || " "}
        </p>
      </div>

      {/* Confirm Password */}
      <div className="mb-6">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-1.5 block">
          Confirm Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Lock size={18} />
          </span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            className={inputClass(error.confirmPassword)}
          />
        </div>
        <p className="text-red-500 text-[10px] mt-1 ml-1 h-4 font-mono">
          {error.confirmPassword || " "}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={buttonClass}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
            <span>Compiling Profile...</span>
          </>
        ) : (
          <span>Register</span>
        )}
      </button>

      <div className="mt-6 text-center text-neutral-500 text-xs">
        <span>Already have an account?</span>
        <button
          type="button"
          onClick={() => switchView("login")}
          disabled={loading}
          className="ml-1.5 font-bold text-white hover:underline transition duration-200 focus:outline-none cursor-pointer disabled:opacity-50"
        >
          Log in
        </button>
      </div>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <div className="flex items-center justify-start mb-2">
        <button
          type="button"
          onClick={() => switchView("login")}
          disabled={loading}
          className="mr-3 p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 cursor-pointer transition disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Reset Password
        </h2>
      </div>
      <p className="text-neutral-400 mb-8 text-sm">
        Enter your registered email to receive recovery instructions.
      </p>
      
      <div className="mb-6">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-1.5 block">
          Recovery Email
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Mail size={18} />
          </span>
          <input
            type="email"
            name="email"
            placeholder="dev@runtime.social"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className={inputClass(error.email)}
          />
        </div>
        <p className="text-red-500 text-[10px] mt-1 ml-1 h-4 font-mono">
          {error.email || " "}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={buttonClass}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
            <span>Transmitting Packets...</span>
          </>
        ) : (
          <span>Send Reset Link</span>
        )}
      </button>
    </>
  );

  const renderPasswordChangeForm = () => (
    <>
      <div className="flex items-center justify-start mb-2">
        <button
          type="button"
          onClick={() => switchView("login")}
          disabled={loading}
          className="mr-3 p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 cursor-pointer transition disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          New Credentials
        </h2>
      </div>
      <p className="text-neutral-400 mb-8 text-sm">
        Enter your new password below to update access credentials.
      </p>

      {/* New Password */}
      <div className="mb-4">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-1.5 block">
          New Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Lock size={18} />
          </span>
          <input
            type="password"
            name="newPassword"
            placeholder="min. 6 characters"
            value={formData.newPassword || ""}
            onChange={handleChange}
            disabled={loading}
            className={inputClass(error.newPassword)}
          />
        </div>
        <p className="text-red-500 text-[10px] mt-1 ml-1 h-4 font-mono">
          {error.newPassword || " "}
        </p>
      </div>

      {/* Confirm Password */}
      <div className="mb-6">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 mb-1.5 block">
          Confirm Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Lock size={18} />
          </span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="verify password match"
            value={formData.confirmPassword || ""}
            onChange={handleChange}
            disabled={loading}
            className={inputClass(error.confirmPassword)}
          />
        </div>
        <p className="text-red-500 text-[10px] mt-1 ml-1 h-4 font-mono">
          {error.confirmPassword || " "}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={buttonClass}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
            <span>Patching Database...</span>
          </>
        ) : (
          <span>Change Password</span>
        )}
      </button>
    </>
  );

  const renderTokenError = () => (
    <>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
          <KeyRound size={22} />
        </div>
        <h2 className="text-2xl font-extrabold mb-2 text-white tracking-tight">
          Invalid or Expired Link
        </h2>
        <p className="text-neutral-400 mb-8 text-sm leading-relaxed max-w-sm">
          This password reset token has expired, been used, or is invalid. Please request a new recovery link.
        </p>

        <button
          type="button"
          onClick={() => switchView("forgotPassword")}
          className={buttonClass}
        >
          Request New Reset Link
        </button>

        <button
          type="button"
          onClick={() => switchView("login")}
          className="w-full mt-3 py-3 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 text-white font-semibold transition duration-200 cursor-pointer text-sm"
        >
          Back to Login
        </button>
      </div>
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
    <form onSubmit={handleSubmit} className="w-full relative min-h-[440px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-full"
        >
          {renderForm()}
        </motion.div>
      </AnimatePresence>
    </form>
  );
};

export default AuthForm;
