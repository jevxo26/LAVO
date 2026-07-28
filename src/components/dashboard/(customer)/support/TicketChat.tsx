"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  User,
  Activity
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/toast";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderRole: string;
}

interface TicketDetails {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  assignedToName: string | null;
  customerId: string;
  customerName: string;
  createdAt: string;
  messages: Message[];
}

interface TicketChatProps {
  ticketId: string;
  backUrl: string;
}

export function TicketChat({ ticketId, backUrl }: TicketChatProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadTicketDetails = async () => {
    try {
      const res = await authFetch(`/tickets/${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.data);
        setMessages(data.data.messages || []);
      } else {
        toast.error(data.message || "Failed to load ticket details");
        router.push(backUrl);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading ticket details");
      router.push(backUrl);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  useEffect(() => {
    if (!ticket) return;

    // Connect socket
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.startsWith('http') 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
      : window.location.origin;
    const newSocket = io(socketUrl);
    
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinTicketChat", ticketId);
    });

    newSocket.on("newTicketMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("ticketStatusUpdated", (data: { ticketId: string; status: string }) => {
      if (data.ticketId === ticketId) {
        toast.info(`Ticket status updated to: ${data.status}`);
        loadTicketDetails();
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [ticketId, ticket?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStatusUpdate = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Ticket marked as ${newStatus === 'solved' ? 'solved' : 'chat enabled'}`);
        loadTicketDetails();
      } else {
        toast.error(data.message || "Failed to update ticket status");
      }
    } catch {
      toast.error("Error updating status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !user || !ticket) return;

    socket.emit("sendTicketMessage", {
      ticketId: ticket.id,
      senderId: user.id,
      senderRole: user.userType,
      content: input.trim(),
    });

    setInput("");
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Loader2 size={36} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading ticket conversation...</p>
      </div>
    );
  }

  if (!ticket) return null;

  const isChatActive = ticket.status === "enabled-live-chat";
  const isSolved = ticket.status === "solved";
  const isPending = ticket.status === "pendingReview";

  const getPriorityStyle = (prio: string) => {
    switch (prio.toUpperCase()) {
      case "HIGH":
      case "URGENT":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "enabled-live-chat":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "solved":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(backUrl)}
          className="w-fit rounded-xl gap-2 font-semibold text-slate-600 border-slate-200"
        >
          <ArrowLeft size={16} /> Back to Tickets
        </Button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isPending && (
            <Button
              onClick={() => handleStatusUpdate("enabled-live-chat")}
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold px-5 shadow-sm"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <MessageSquare size={16} className="mr-2" />}
              Enable Live Chat
            </Button>
          )}

          {isChatActive && (
            <Button
              onClick={() => handleStatusUpdate("solved")}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold px-5 shadow-sm"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />}
              Disable Chat & Mark as Solved
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Ticket Details Panel */}
        <Card className="lg:col-span-4 border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getPriorityStyle(ticket.priority)}`}>
                {ticket.priority} Priority
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getStatusStyle(ticket.status)}`}>
                {ticket.status === 'pendingReview' ? 'Pending Review' : ticket.status === 'enabled-live-chat' ? 'Live Chat Active' : 'Solved'}
              </span>
            </div>
            <CardTitle className="text-lg font-extrabold text-slate-900 leading-snug">{ticket.title}</CardTitle>
            <CardDescription className="text-xs flex items-center gap-1 font-medium text-slate-400 mt-1">
              <Clock size={12} /> Opened on {new Date(ticket.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Description</label>
              <p className="text-slate-700 text-sm leading-relaxed mt-1 whitespace-pre-line">{ticket.description}</p>
            </div>
            
            <hr className="border-slate-100" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Customer</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {ticket.customerName.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{ticket.customerName}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Assigned Agent</label>
                <div className="flex items-center gap-2 mt-1">
                  {ticket.assignedToName ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {ticket.assignedToName.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{ticket.assignedToName}</span>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Chat Panel */}
        <Card className="lg:col-span-8 border border-slate-100 shadow-sm rounded-3xl overflow-hidden flex flex-col h-[550px]">
          {/* Status Banners */}
          {isPending && (
            <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-center gap-2.5 text-amber-800 shrink-0">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-xs font-semibold">This ticket is pending review. Live chat is not yet enabled.</p>
            </div>
          )}

          {isSolved && (
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2.5 text-slate-500 shrink-0">
              <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
              <p className="text-xs font-semibold">This ticket is marked as solved. Chat history is read-only.</p>
            </div>
          )}

          {isChatActive && (
            <div className="bg-emerald-50/50 border-b border-emerald-100/50 px-4 py-3 flex items-center gap-2.5 text-emerald-800 shrink-0">
              <Activity size={18} className="shrink-0 text-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold">Real-time support channel active. Send a message to chat.</p>
            </div>
          )}

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <MessageSquare size={36} className="mb-2 text-slate-200" />
                <p className="text-sm font-semibold">No messages in this ticket yet.</p>
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
                          <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[9px] font-bold" title={msg.senderName}>
                            {msg.senderName.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                      {!isMe && showAvatar && (
                        <span className="text-[10px] text-slate-400 font-bold ml-1">{msg.senderName} ({msg.senderRole})</span>
                      )}
                      <div
                        className={`px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-[#0084FF] text-white rounded-[20px] rounded-br-sm"
                            : "bg-white border border-slate-100 text-slate-900 rounded-[20px] rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input field */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!isChatActive}
              placeholder={isChatActive ? "Write a message..." : "Live chat is inactive"}
              className="flex-1 bg-[#F0F2F5] text-black border-transparent focus:bg-[#E4E6EB] focus:outline-none rounded-full px-4 py-2.5 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || !isChatActive}
              className="w-10 h-10 rounded-full text-[#0084FF] hover:bg-blue-50 flex items-center justify-center disabled:opacity-50 transition-colors shrink-0"
            >
              <Send size={20} />
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
