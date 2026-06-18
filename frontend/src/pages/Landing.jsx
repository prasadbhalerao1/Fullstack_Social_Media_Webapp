import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Plus,
  ArrowRight,
  Code,
  Film,
  Users,
  MessageSquare,
  Sparkles
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const handleAuth = (view) => {
    if (view === "register") {
      navigate("/login?view=register");
    } else {
      navigate("/login");
    }
  };

  const features = [
    {
      icon: <Code className="text-cyan-400 w-5 h-5" />,
      title: "Interactive Feed",
      description: "Post development updates, share code snippet components, write comments, and react to other developer posts.",
      hoverClass: "glow-card-cyan",
      borderClass: "border-glow-cyan",
      bgClass: "bg-cyan-950/30 border-cyan-500/10",
      tag: "React Feed",
      tagClass: "text-cyan-400 border-cyan-500/10 bg-cyan-950/20"
    },
    {
      icon: <Film className="text-amber-400 w-5 h-5" />,
      title: "Developer Reels",
      description: "Upload and view short-form programming reels and workflows, hosted on Cloudinary CDN storage.",
      hoverClass: "glow-card-amber",
      borderClass: "border-glow-amber",
      bgClass: "bg-amber-950/30 border-amber-500/10",
      tag: "Cloudinary Video",
      tagClass: "text-amber-400 border-amber-500/10 bg-amber-950/20"
    },
    {
      icon: <MessageSquare className="text-emerald-400 w-5 h-5" />,
      title: "Socket.io Direct Chats",
      description: "Real-time communication with low-latency WebSockets, active typing indicators, and shared media.",
      hoverClass: "glow-card-emerald",
      borderClass: "border-glow-emerald",
      bgClass: "bg-emerald-950/30 border-emerald-500/10",
      tag: "WebSockets Live",
      tagClass: "text-emerald-400 border-emerald-500/10 bg-emerald-950/20"
    },
    {
      icon: <Users className="text-sky-400 w-5 h-5" />,
      title: "Developer Profiles",
      description: "Customize your bio, check followers and followings list, and share daily status stories.",
      hoverClass: "glow-card-sky",
      borderClass: "border-glow-sky",
      bgClass: "bg-sky-950/30 border-sky-500/10",
      tag: "Active Stories",
      tagClass: "text-sky-400 border-sky-500/10 bg-sky-950/20"
    }
  ];

  const mockAvatars = [
    { name: "TU", bg: "bg-cyan-900 border-cyan-400/30" },
    { name: "AG", bg: "bg-emerald-900 border-emerald-400/30" },
    { name: "PM", bg: "bg-amber-900 border-amber-400/30" },
    { name: "CC", bg: "bg-slate-800 border-slate-700/30" },
    { name: "DD", bg: "bg-neutral-800 border-neutral-700/30" }
  ];

  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden flex flex-col justify-between">
      
      {/* Ambient radial lighting overlays (Cyan & Emerald) */}
      <div className="absolute inset-0 radial-glow-cyan pointer-events-none z-0" />
      <div className="absolute inset-0 radial-glow-emerald pointer-events-none z-0" />

      {/* Grid background structure with fade mask */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] grid-mask"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: "32px 32px"
        }}
      />

      {/* Header Bar */}
      <header className="h-20 bg-black/40 backdrop-blur-md border-b border-white/5 px-6 sm:px-12 flex items-center justify-between shrink-0 relative z-30">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="logo" className="w-10 h-10 object-contain" />
          <span className="font-black text-xl tracking-wider text-white select-none">
            RUNTIME
          </span>
        </div>

        <div>
          <button 
            onClick={() => handleAuth("login")}
            className="bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl transition duration-200 shadow-md hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center flex-1 w-full">
        
        {/* Left Column: Typography and Descriptions */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-left">
          
          {/* Tagline Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="self-start inline-flex items-center gap-2 bg-neutral-900 border border-white/10 px-3.5 py-1.5 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-cyan" />
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
              The social network for developers
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] text-white flex flex-col gap-1"
          >
            <span>CODE.</span>
            <span>CONNECT.</span>
            <span className="text-gradient-cyan-green">BUILD TOGETHER.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-neutral-400 text-sm sm:text-base font-normal leading-relaxed max-w-md"
          >
            A high-fidelity social hub built exclusively for developers. Showcase your workflow milestones, share source snippets, watch dev reels, and chat with peers.
          </motion.p>

          {/* CTA triggers */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mt-2"
          >
            <button
              onClick={() => handleAuth("register")}
              className="bg-white hover:bg-neutral-200 text-black font-extrabold px-8 py-3.5 rounded-2xl transition duration-250 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] active:scale-95 cursor-pointer flex items-center gap-2 group"
            >
              <span>Start Building</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleAuth("login")}
              className="bg-transparent border border-white/15 hover:border-cyan-500/40 text-white font-bold px-8 py-3.5 rounded-2xl transition duration-200 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-4 mt-4 border-t border-white/5 pt-6"
          >
            <div className="flex -space-x-2.5">
              {mockAvatars.map((av, idx) => (
                <div 
                  key={idx} 
                  className={`w-8 h-8 rounded-full ${av.bg} border-2 border-black flex items-center justify-center text-[9px] font-bold text-white shadow-md`}
                >
                  {av.name}
                </div>
              ))}
            </div>
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              Connecting developer minds across communities
            </span>
          </motion.div>
        </div>

        {/* Right Column: 3D High-Fidelity App Feed Preview */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end relative">
          
          {/* Ambient glow backing the mockup card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 blur-[80px] rounded-full pointer-events-none z-0" />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-[560px] mockup-perspective-cyan-emerald bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl select-none z-10"
          >
            {/* Dashboard Header Mock */}
            <div className="bg-neutral-950/80 border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="logo" className="w-5 h-5 object-contain" />
                <span className="font-black text-xs tracking-wider text-white">RUNTIME</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
              </div>
            </div>

            {/* Dashboard Layout Mock */}
            <div className="flex h-[320px] text-[10px]">
              
              {/* Sidebar Mock */}
              <div className="w-1/4 bg-black border-r border-white/10 p-3 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="h-6 bg-gradient-to-r from-cyan-950/60 to-neutral-900 border-l-2 border-cyan-400 text-white font-semibold rounded-r-xl flex items-center px-3 gap-2">
                    <span className="text-cyan-400">⌂</span>
                    <span>Home</span>
                  </div>
                  <div className="h-6 text-neutral-500 rounded-xl flex items-center px-3 gap-2">
                    <span>🧭</span>
                    <span>Explore</span>
                  </div>
                  <div className="h-6 text-neutral-500 rounded-xl flex items-center px-3 gap-2">
                    <span>☊</span>
                    <span>Reels</span>
                  </div>
                  <div className="h-6 text-neutral-500 rounded-xl flex items-center px-3 gap-2">
                    <span>✉</span>
                    <span>Messages</span>
                  </div>
                </div>

                <div className="bg-white hover:bg-neutral-200 text-black font-semibold h-7 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-white/5 cursor-pointer">
                  <Plus size={10} />
                  <span>Create</span>
                </div>
              </div>

              {/* Feed Content Mock */}
              <div className="flex-1 bg-black p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
                
                {/* Story list mock */}
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar border-b border-white/5">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-7 h-7 rounded-full border border-dashed border-white/20 flex items-center justify-center text-neutral-500">
                      <Plus size={8} />
                    </div>
                    <span className="text-[7px] text-neutral-500">Create story</span>
                  </div>
                  {[
                    { name: "testuser", grad: "from-cyan-400 to-emerald-400" },
                    { name: "antigravity", grad: "from-emerald-400 to-teal-500" },
                    { name: "pixel_magic", grad: "from-sky-400 to-cyan-500" }
                  ].map((usr) => (
                    <div key={usr.name} className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`w-7 h-7 rounded-full p-[1px] bg-gradient-to-tr ${usr.grad}`}>
                        <div className="w-full h-full rounded-full bg-black border border-black flex items-center justify-center text-[7px] text-white font-bold">
                          {usr.name[0].toUpperCase()}{usr.name[2]?.toUpperCase() || ""}
                        </div>
                      </div>
                      <span className="text-[7px] text-neutral-400">{usr.name}</span>
                    </div>
                  ))}
                </div>

                {/* Feed Post Mock */}
                <div className="bg-black border border-white/10 rounded-2xl p-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-neutral-850 flex items-center justify-center text-[8px] text-cyan-400 font-bold border border-white/10">
                        TU
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">testuser</span>
                        <span className="text-[6.5px] text-neutral-500">Full-stack dev • 1h ago</span>
                      </div>
                    </div>
                    <span className="text-neutral-500">•••</span>
                  </div>

                  <div className="bg-neutral-950 border border-white/5 rounded-lg p-2.5 font-mono text-[7px] leading-normal text-neutral-400">
                    <span className="text-neutral-500">// WebSocket live listener</span><br />
                    <span className="text-cyan-400">const</span> socket = io(<span className="text-emerald-400">'ws://localhost:5000'</span>);<br />
                    socket.on(<span className="text-amber-300">connect</span>, () =&gt; &#123;<br />
                    &nbsp;&nbsp;console.log(<span className="text-emerald-400">'Websocket OK'</span>);<br />
                    &#125;);
                  </div>

                  <div className="flex justify-between items-center text-neutral-400 pt-1 border-t border-white/5">
                    <div className="flex gap-4">
                      <Heart size={9} className="text-red-500" fill="currentColor" />
                      <MessageCircle size={9} className="text-cyan-400" />
                      <Send size={9} className="text-emerald-400" />
                    </div>
                    <Bookmark size={9} className="text-sky-400" />
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>

      </main>

      {/* Grid Factual Features section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-12 border-t border-white/10 mt-6 pb-20 w-full">
        {/* Section Header */}
        <div className="flex flex-col gap-1.5 text-left mb-10">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase font-mono">Core Modules</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Engineered for Developer Interaction</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`${feature.hoverClass} ${feature.borderClass} bg-neutral-950 border border-white/10 p-6 rounded-3xl flex flex-col gap-4 text-left group`}
            >
              <div className="flex items-start justify-between">
                <div className={`${feature.bgClass} border w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition duration-300`}>
                  {feature.icon}
                </div>
                <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full border ${feature.tagClass} select-none`}>
                  {feature.tag}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-bold text-base text-white group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 text-xs font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mini footer */}
      <footer className="relative z-10 h-16 border-t border-white/10 px-6 sm:px-12 flex items-center justify-between text-[10px] text-neutral-600 shrink-0 font-mono w-full max-w-7xl mx-auto select-none">
        <div className="flex items-center gap-1">
          <span>© 2026 RUNTIME.</span>
          <span>Crafted by <a href="https://github.com/prasadbhalerao1" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-400 text-neutral-600 transition duration-200 cursor-pointer">Prasad Bhalerao</a></span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://www.linkedin.com/in/prasadbhalerao/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-400 text-neutral-600 transition duration-200 cursor-pointer">CONNECT</a>
          <span className="hidden sm:inline">Built by Developers, for Developers</span>
        </div>
      </footer>
    </div>
  );
}
