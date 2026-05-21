import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { motion } from "motion/react";

export function Auth({ children }: { children: (user: User) => React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSubmit = async () => {
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono uppercase tracking-widest text-xs">
        Initializing Core...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full blur-[100px] bg-neutral-800" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 px-6">
          <h1 className="text-4xl font-bold tracking-tighter opacity-90 uppercase">ZARA.AI</h1>
          <p className="text-neutral-400 max-w-sm text-sm">
            Please login to continue your session.
          </p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-72 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-72 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="w-72 py-3 bg-white text-black font-semibold rounded-full uppercase tracking-wider text-sm hover:bg-neutral-200 transition-colors"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </motion.button>
          <p
            className="text-neutral-500 text-xs cursor-pointer hover:text-white"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have account? Login" : "New user? Sign Up"}
          </p>
        </div>
      </div>
    );
  }

  return <>{children(user)}</>;
}
