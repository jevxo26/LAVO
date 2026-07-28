"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { X, Send, Loader2, User, MessageSquare } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface LiveChatModalProps {
  targetRole: "ADMIN" | "BRANCH_MANAGER" | null;
  branchId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

export default function LiveChatModal({ targetRole, branchId, isOpen, onClose }: LiveChatModalProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && targetRole && user) {
      initChat();
    } else {
      if (socket) socket.disconnect();
    }
    return () => {
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetRole]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initChat = async () => {
    setLoading(true);
    try {
      // 1. Fetch or create session
      const res = await authFetch("/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, branchId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      const sId = data.data.id;
      setSessionId(sId);

      // 2. Fetch history
      const histRes = await authFetch(`/chat/sessions/${sId}/messages`);
      const histData = await histRes.json();
      if (histData.success) {
        setMessages(histData.data);
      }

      // 3. Connect socket
      const socketUrl = process.env.NEXT_PUBLIC_API_URL?.startsWith('http') 
        ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
        : window.location.origin;
      const newSocket = io(socketUrl);
      
      newSocket.on("connect", () => {
        newSocket.emit("joinChat", sId);
      });

      // Also handle immediate join if already connected (though usually not for a fresh instance)
      if (newSocket.connected) {
        newSocket.emit("joinChat", sId);
      }
      
      newSocket.on("newMessage", (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
      });

      setSocket(newSocket);
    } catch (err) {
      console.error("Failed to init chat", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !sessionId || !user) return;

    socket.emit("sendMessage", {
      sessionId,
      senderId: user.id,
      senderRole: user.userType,
      content: input.trim(),
    });

    setInput("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[600px] max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex items-center justify-between shadow-md z-10 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">
                  {targetRole === "ADMIN" ? "Central Support" : "Branch Support"}
                </h3>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Typically replies instantly
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat Body */}
          <div ref={scrollRef} className="flex-1 bg-white p-4 overflow-y-auto space-y-4">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <MessageSquare className="text-slate-300" size={28} />
                </div>
                <p className="text-sm font-medium">Say hi to start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.id;
                const prevMsg = messages[idx - 1];
                const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);

                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                    {!isMe && (
                      <div className="w-6 h-6 shrink-0">
                        {showAvatar && (
                          <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {msg.senderRole === 'ADMIN' ? 'A' : 'B'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[75%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
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

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Aa"
              className="flex-1 bg-[#F0F2F5] text-black border-transparent focus:bg-[#E4E6EB] focus:outline-none rounded-full px-4 py-2 text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full text-[#0084FF] hover:bg-blue-50 flex items-center justify-center disabled:opacity-50 transition-colors shrink-0"
            >
              <Send size={20} className="ml-0.5" />
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
