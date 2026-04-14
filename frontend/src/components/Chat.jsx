import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat({ user, setUser }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const chatEndRef = useRef(null);

  // =========================
  // ✅ REGISTER USER (ONLINE)
  // =========================
  useEffect(() => {
    if (user) {
      socket.emit("register_user", user);
    }
  }, [user]);

  // =========================
  // ✅ RECEIVE ONLINE USERS
  // =========================
  useEffect(() => {
    socket.on("online_users", (usersList) => {
      setUsers(usersList);
    });

    return () => {
      socket.off("online_users");
    };
  }, []);

  // =========================
  // ✅ JOIN ROOM + LOAD MSG
  // =========================
  useEffect(() => {
    if (!selectedUser) return;

    socket.emit("join_private_chat", {
      user1: user,
      user2: selectedUser,
    });

    socket.emit("load_private_messages", {
      user1: user,
      user2: selectedUser,
    });
  }, [selectedUser, user]);

  // =========================
  // ✅ RECEIVE MESSAGES
  // =========================
  useEffect(() => {
    socket.on("private_messages", (data) => {
      setMessages(data);
    });

    socket.on("receive_private_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("private_messages");
      socket.off("receive_private_message");
    };
  }, []);

  // =========================
  // ✅ AUTO SCROLL
  // =========================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // ✅ SEND MESSAGE
  // =========================
  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;

    socket.emit("send_private_message", {
      user1: user,
      user2: selectedUser,
      text,
    });

    setText("");
  };

  // =========================
  // ✅ LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="flex h-[100dvh] bg-[#11131a] text-gray-200 font-sans selection:bg-fuchsia-500/30 overflow-hidden">
      
      {/* 🔥 SIDEBAR */}
      {/* Mobile: Hidden if a user is selected. Desktop: Always visible */}
      <div 
        className={`${
          selectedUser ? "hidden md:flex" : "flex"
        } w-full md:w-[280px] bg-[#0b0d14] flex-col border-r border-white/5 h-full flex-shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold tracking-tight text-white mb-6 md:mb-8">
            Nocturnal Curator
          </h2>
          <div className="flex items-center gap-3 mb-4 md:mb-8">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-cyan-900/40 border border-cyan-500/50 flex items-center justify-center">
                <span className="text-cyan-400 text-sm">🎙️</span>
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#0b0d14]"></div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{user}</div>
              <div className="text-xs text-gray-500">In the lounge</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu (Hidden on small mobile to save space, visible on tablet+) */}
        <div className="hidden sm:block flex-1 px-4 mb-4 md:mb-0">
          <div className="bg-[#171a23] text-fuchsia-400 rounded-lg p-3 flex items-center gap-3 cursor-pointer border-l-2 border-fuchsia-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path></svg>
            <span className="font-medium text-sm">Messages</span>
          </div>
          <div className="text-gray-400 hover:bg-[#171a23]/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer mt-1 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            <span className="font-medium text-sm">Channels</span>
          </div>
          <div className="text-gray-400 hover:bg-[#171a23]/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer mt-1 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span className="font-medium text-sm">Contacts</span>
          </div>
        </div>

        {/* New Conversation Button */}
        <div className="px-4 md:px-6 py-2 md:py-4">
          <button className="w-full bg-gradient-to-r from-[#b558f6] to-[#7f40f0] text-white font-medium py-3 rounded-xl shadow-[0_0_20px_rgba(181,88,246,0.3)] hover:shadow-[0_0_25px_rgba(181,88,246,0.5)] transition-all">
            New Conversation
          </button>
        </div>

        {/* Recent Whispers (Users List) */}
        <div className="pb-6 overflow-y-auto flex-1">
          <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-3 px-4 md:px-6 uppercase mt-2">
            Recent Whispers
          </p>
          <div className="px-3 md:px-4 space-y-1">
            {users.length === 0 ? (
              <p className="text-sm text-gray-600 px-2">No users online</p>
            ) : (
              users
                .filter((u) => u !== user)
                .map((u) => (
                  <div
                    key={u}
                    onClick={() => setSelectedUser(u)}
                    className={`flex items-center gap-3 p-3 md:p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedUser === u ? "bg-[#171a23]" : "hover:bg-[#171a23]/50"
                    }`}
                  >
                    <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {u.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className={`text-[15px] md:text-sm truncate ${selectedUser === u ? "text-white font-medium" : "text-gray-300 md:text-gray-400"}`}>
                        {u}
                      </span>
                      <span className="text-xs text-gray-500 md:hidden truncate">Tap to chat</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* 🔥 MAIN CHAT */}
      {/* Mobile: Hidden if NO user is selected. Desktop: Always visible */}
      <div 
        className={`${
          !selectedUser ? "hidden md:flex" : "flex"
        } flex-col flex-1 bg-[#11131a] relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)] h-[100dvh]`}
      >
        {/* NAVBAR */}
        <div className="h-16 md:h-20 flex justify-between items-center px-4 md:px-8 border-b border-white/5 flex-shrink-0 bg-[#11131a]/90 backdrop-blur-md z-10">
          {selectedUser ? (
            <div className="flex items-center gap-3 md:gap-4">
              {/* Back Button for Mobile */}
              <button 
                onClick={() => setSelectedUser("")}
                className="md:hidden text-gray-400 hover:text-white p-1 -ml-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              
              <div className="relative">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-700 flex items-center justify-center text-base md:text-lg font-bold text-white">
                  {selectedUser.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#11131a]"></div>
              </div>
              <div className="overflow-hidden">
                <h1 className="font-semibold text-white tracking-wide truncate text-sm md:text-base">
                  {selectedUser}
                </h1>
                <p className="text-[11px] md:text-xs text-cyan-400 truncate">Collaborating currently...</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 font-medium tracking-wide hidden md:block">
              Select a whisper to begin
            </div>
          )}

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden lg:block">
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder="Search archive..." 
                className="bg-[#1a1d27] text-sm text-gray-300 rounded-full pl-9 pr-4 py-2 outline-none border border-transparent focus:border-white/10 w-64"
              />
            </div>
            {/* Search Icon (Visible only on medium screens) */}
            <button className="hidden md:block lg:hidden text-gray-400 hover:text-white transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            <button className="hidden md:block text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
              title="Logout"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-6">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
               <svg className="w-12 h-12 mb-4 text-fuchsia-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 9H22L16.5 14L18 21L12 17L6 21L7.5 14L2 9H9L12 2Z"></path></svg>
              <p className="text-lg md:text-xl font-light italic text-gray-400">
                Silence is golden. Start a conversation.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
              <svg className="w-10 h-10 md:w-12 md:h-12 mb-4 text-fuchsia-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 9H22L16.5 14L18 21L12 17L6 21L7.5 14L2 9H9L12 2Z"></path></svg>
              <p className="text-base md:text-xl font-light italic text-gray-400">
                Silence is golden. Start a conversation.
              </p>
            </div>
          ) : (
            <>
              {/* Date Separator */}
              <div className="flex justify-center my-2 md:my-4">
                <span className="bg-[#1a1d27] text-gray-400 text-[9px] md:text-[10px] font-bold tracking-widest uppercase px-3 md:px-4 py-1.5 rounded-full">
                  Twilight Hours
                </span>
              </div>

              {messages.map((msg, i) => {
                const isOwn = msg.user === user;

                return (
                  <div key={i} className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-2 md:gap-3 max-w-[85%] md:max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      
                      {/* Avatar for received messages */}
                      {!isOwn && (
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-white mt-auto mb-5 md:mb-6">
                           {msg.user.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <div
                          className={`px-4 py-3 md:px-5 md:py-3.5 rounded-2xl text-[14px] md:text-[15px] leading-relaxed shadow-sm ${
                            isOwn
                              ? "bg-gradient-to-r from-[#b558f6] to-[#7f40f0] text-white rounded-br-sm"
                              : "bg-[#252833] text-gray-200 rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className={`text-[9px] md:text-[10px] text-gray-500 mt-1 md:mt-2 flex items-center gap-1.5 md:gap-2 ${isOwn ? "justify-end" : "justify-start ml-1"}`}>
                          {!isOwn && <span className="font-medium text-gray-400">{msg.user}</span>}
                          {!isOwn && <span>•</span>}
                          <span>
                            {new Date(msg.time || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isOwn && (
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </>
          )}
          <div ref={chatEndRef}></div>
        </div>

        {/* INPUT */}
        {selectedUser && (
          <div className="px-3 pb-3 pt-1 md:px-8 md:pb-8 md:pt-2 flex-shrink-0 bg-[#11131a]">
            <div className="flex items-center gap-2 md:gap-3 bg-[#1e222d] rounded-full p-1.5 md:p-2 pl-3 md:pl-4 border border-white/5 shadow-inner">
              <button className="text-gray-400 hover:text-white transition-colors bg-[#2a2f3d] p-1.5 rounded-full hidden sm:block">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </button>
              
              <input
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none px-2 text-[14px] md:text-[15px]"
                placeholder="Message into the void..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              
              <button className="text-gray-400 hover:text-white transition-colors mr-1 md:mr-2">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </button>

              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#f0abfc] to-[#d946ef] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-[0_0_15px_rgba(217,70,239,0.3)] flex-shrink-0"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;