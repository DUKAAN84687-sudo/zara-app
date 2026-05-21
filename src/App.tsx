import { motion, AnimatePresence } from "motion/react";
import { Mic, Power, Loader2, AlertCircle, LogOut } from "lucide-react";
import { useLiveSession } from "./lib/live-session";
import { Auth } from "./components/Auth";
import { signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useState, useEffect } from "react";

import idleImg from "./assets/images/anime_girl_idle_1779266210886.png";
import speakingImg from "./assets/images/anime_girl_speaking_1779266227589.png";

export default function AppWrapper() {
  return (
    <App user={null} />
  );
}

function App({ user }: { user: any }) {
  const { state, error, startSession, stopSession } = useLiveSession(user);
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    let timeout: any;
    const animateMouth = () => {
      setMouthOpen(prev => !prev);
      timeout = setTimeout(animateMouth, Math.random() * 150 + 100);
    };
    if (state === "speaking") {
      animateMouth();
    } else {
      setMouthOpen(false);
    }
    return () => clearTimeout(timeout);
  }, [state]);

  const handleToggle = () => {
    if (state === "idle") {
      startSession();
    } else {
      stopSession();
    }
  };

  const handleLogout = async () => {
    try {
      if (state !== "idle") {
        stopSession();
      }
      await signOut(auth);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const isConnected = state === "listening" || state === "speaking";

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Background Ambient Gradients */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
        <motion.div
          animate={{
            scale: state === "speaking" ? [1, 1.2, 1] : state === "listening" ? [1, 1.05, 1] : 1,
            opacity: state === "speaking" ? 0.9 : state === "listening" ? 0.6 : 0.3,
          }}
          transition={{
            duration: state === "speaking" ? 1.5 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`w-[800px] h-[800px] rounded-full blur-[120px] transition-colors duration-1000 ${
            state === "speaking" ? "bg-pink-600" : state === "listening" ? "bg-cyan-600" : "bg-neutral-800"
          }`}
        />
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tighter opacity-90 uppercase text-pink-400">ZARA.AI</h1>
          <span className="text-xs font-mono uppercase tracking-widest opacity-50">
            Companion Interface
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500"}`} />
            <span className="text-xs font-mono uppercase tracking-widest opacity-50">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Avatar Area */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.button
          onClick={handleToggle}
          className="relative flex items-center justify-center outline-none group"
          whileHover={{ scale: state === "idle" ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Avatar Container */}
          <motion.div
            animate={{
              boxShadow: state === "speaking" 
                ? "0 0 60px rgba(236,72,153,0.8)" 
                : state === "listening"
                ? "0 0 40px rgba(6,182,212,0.6)"
                : "0 0 20px rgba(0,0,0,0.5)"
            }}
            className={`w-64 h-64 md:w-80 md:h-80 relative flex items-center justify-center rounded-full transition-all duration-1000 overflow-hidden border-4 ${
              state === "idle"
                ? "border-neutral-700 group-hover:border-neutral-500"
                : state === "listening"
                ? "border-cyan-400"
                : state === "speaking"
                ? "border-pink-500"
                : "border-neutral-800"
            }`}
          >
            {/* The Anime Girl images */}
            <img 
              src={mouthOpen ? speakingImg : idleImg} 
              alt="Zara" 
              className="absolute w-full h-full object-cover transition-opacity duration-75"
            />
            
            {/* Overlay for inactive states */}
            {state === "idle" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm transition-all group-hover:bg-black/40">
                <Power className="w-12 h-12 text-white/70" />
              </div>
            )}
            {state === "connecting" && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-white/80 animate-spin" />
              </div>
            )}
          </motion.div>
          
          {/* Connecting outer rings */}
          <AnimatePresence>
            {isConnected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(2)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute inset-[-15%] rounded-full border-2 opacity-40 ${
                       state === "speaking" ? "border-pink-400 border-dashed" : "border-cyan-400"
                    }`}
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: i * 180 + 360,
                    }}
                    transition={{
                      duration: state === "speaking" ? 2 : 4,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </motion.button>

        <div className="mt-14 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-xl font-bold tracking-widest ${
                state === "speaking" ? "text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" : state === "listening" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "text-neutral-500 font-mono tracking-[0.2em]"
              }`}
            >
              {state === "idle" && "TAP TO CALL ZARA"}
              {state === "connecting" && "CALLING..."}
              {state === "listening" && "LISTENING..."}
              {state === "speaking" && "SPEAKING..."}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Error Output */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-10 flex items-center space-x-3 bg-red-950/80 border border-red-900 px-6 py-3 rounded-xl max-w-lg mb-8 backdrop-blur-md z-30"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-200 text-sm font-mono">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
