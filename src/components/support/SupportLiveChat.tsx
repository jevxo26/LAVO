"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Send, User, MessageCircle, X } from "lucide-react";

interface ChatSession {
  id: string;
  customerName: string;
  targetRole: string;
  status: string;
  lastMessage: string | null;
  lastMessageAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

export function SupportLiveChat() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.startsWith('http') 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
      : window.location.origin;
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      if (activeSession) {
        newSocket.emit("joinChat", activeSession.id);
      }
    });

    newSocket.on("chatSessionUpdated", () => {
      loadSessions();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeSession && socket) {
      socket.emit("joinChat", activeSession.id);
      loadMessages(activeSession.id);

      socket.on("newMessage", (msg: ChatMessage) => {
        if (msg.sessionId === activeSession.id) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      return () => {
        socket.off("newMessage");
      };
    }
  }, [activeSession, socket]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loadSessions = async () => {
    try {
      const res = await authFetch("/chat/sessions");
      const data = await res.json();
      if (data.success) setSessions(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await authFetch(`/chat/sessions/${sessionId}/messages`);
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !activeSession || !user) return;

    socket.emit("sendMessage", {
      sessionId: activeSession.id,
      senderId: user.id,
      senderRole: user.userType,
      content: input.trim(),
    });
    setInput("");
  };

  if (!user || (user.userType !== "ADMIN" && user.userType !== "SUPER_ADMIN" && user.userType !== "BRANCH_MANAGER")) {
    return null; // Not allowed
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex h-[600px] mb-8 overflow-hidden">
      {/* Sidebar: Session List */}
      <div className="w-1/3 border-r border-slate-100 bg-slate-50/50 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <MessageCircle size={18} className="text-indigo-600" /> Live Chats
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-10">No active chats</div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activeSession?.id === session.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "hover:bg-white text-slate-700"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm truncate">{session.customerName}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                    activeSession?.id === session.id ? "bg-white/20" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {session.status}
                  </span>
                </div>
                <div className={`text-xs truncate ${activeSession?.id === session.id ? "text-indigo-100" : "text-slate-400"}`}>
                  {session.lastMessage || "No messages yet"}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeSession ? (
          <>
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <User size={18} className="text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{activeSession.customerName}</h3>
                  <p className="text-[10px] text-slate-400">Target: {activeSession.targetRole}</p>
                </div>
              </div>
              <button onClick={() => setActiveSession(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MessageCircle size={40} className="mx-auto mb-2 text-slate-200" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === user.id;
                  const prevMsg = messages[idx - 1];
                  const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);

                  return (
                    <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                      {!isMe && (
                        <div className="w-7 h-7 shrink-0">
                          {showAvatar && (
                            <div className="w-7 h-7 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                              C
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-[#0084FF] text-white rounded-[20px] rounded-br-sm"
                            : "bg-[#E4E6EB] text-black rounded-[20px] rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-[#F0F2F5] text-black border-transparent focus:bg-[#E4E6EB] focus:outline-none rounded-full px-4 py-2 text-sm transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full text-[#0084FF] hover:bg-blue-50 flex items-center justify-center disabled:opacity-50 transition-colors shrink-0"
              >
                <Send size={22} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageCircle size={48} className="mb-4 text-slate-200" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
