import { useState } from "react";
import axios from "axios";
// Removed standard CSS import, using Tailwind directly below

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const url = isLogin
        ? "https://chat-backend-qocw.onrender.com/api/auth/login"
        : "https://chat-backend-qocw.onrender.com/api/auth/signup";

      const res = await axios.post(url, { username, password });

      if (res.data.error) {
        alert(res.data.error);
      } else {
        if (isLogin) {
          localStorage.setItem("token", res.data.token);
          setUser(res.data.username);
        } else {
          alert("Signup successful! Now login.");
          setIsLogin(true);
          setPassword(""); // Clear password for security after signup
        }
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 font-sans">
      
      {/* Glassmorphic Card */}
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
        
        {/* Header Section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-slate-800 border border-slate-700 shadow-inner">
            <span className="text-3xl">✨</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isLogin ? "Sign in to continue to ChromaChat" : "Join the conversation today"}
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 text-slate-200 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-3 text-slate-200 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3.5 mt-2 text-sm font-bold tracking-wide text-white transition-all rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 shadow-lg hover:shadow-fuchsia-500/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : (isLogin ? "Log In" : "Sign Up")}
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setPassword(""); // Clear password when switching modes
            }}
            className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400 focus:outline-none"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Log in"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Auth;