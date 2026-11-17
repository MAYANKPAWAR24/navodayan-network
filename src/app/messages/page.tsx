"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, GraduationCap, Users, MapPin, Send, Sparkles, ArrowLeft } from "lucide-react";
import { dataService } from "@/services/dataService";
import { useAuth } from "@/context/AuthContext";
import { useSoundFX } from "@/context/SoundContext";
import { ChatMessage } from "@/types";
import { toast } from "sonner";

const FILTERS = [
  { id: "all", label: "All Chats" },
  { id: "direct", label: "Direct Messages (1-on-1)" },
  { id: "groups", label: "Groups (School / Batch / City / House)" },
] as const;

const roomCatalog = [
  { id: "school-1", title: "JNV Shimla Official Chapter", type: "groups", tag: "School", icon: GraduationCap, subtitle: "Alumni & Campus Community" },
  { id: "batch-2015", title: "Batch of 2015 National Circle", type: "groups", tag: "Batch", icon: Users, subtitle: "Passout Batchmates Across 660+ JNVs" },
  { id: "city-bengaluru", title: "Bengaluru Navodayan Chapter", type: "groups", tag: "City", icon: MapPin, subtitle: "Local Meetup & Coffee Circle" },
  { id: "dm-arun", title: "Arun Thakur", type: "direct", tag: "Mentor", icon: Users, subtitle: "Direct message • connection request" },
  { id: "dm-priya", title: "Dr. Priya Singh", type: "direct", tag: "1-on-1", icon: Users, subtitle: "Private thread • safe support" },
];

export default function MessagesPage() {
  const { user, requireAuth } = useAuth();
  const { playPop, playTap, playSuccess } = useSoundFX();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [activeRoomId, setActiveRoomId] = useState("school-1");
  const [messages, setMessages] = useState<ChatMessage[]>(() => dataService.getMessages("school-1"));
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const visibleRooms = useMemo(() => {
    return roomCatalog.filter((room) => filter === "all" || room.type === filter);
  }, [filter]);

  useEffect(() => {
    setMessages(dataService.getMessages(activeRoomId));
  }, [activeRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(() => {
      if (!inputText.trim()) return;
      const msg = dataService.sendMessage(activeRoomId, inputText.trim());
      setMessages((prev) => [...prev, msg]);
      setInputText("");
      playSuccess();
      setTimeout(() => {
        if (typeof window !== "undefined") {
          const echo: ChatMessage = {
            id: `reply-${Date.now()}`,
            room_id: activeRoomId,
            sender_id: "ai-copilot",
            sender_name: activeRoomId.startsWith("dm-") ? "Support Bot" : "Campus Pulse",
            sender_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            content: activeRoomId.startsWith("dm-") ? "Message received — your note is in queue for a safe, direct response." : "Thanks for the update! The channel is buzzing with Navodayan energy.",
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, echo]);
          playPop();
        }
      }, 700);
    });
  };

  const activeRoom = roomCatalog.find((r) => r.id === activeRoomId) || roomCatalog[0];

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[500px] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500"><MessageSquare className="h-3.5 w-3.5 text-amber-500" /> Messages</div>
          <div className="mt-1 text-base font-black text-slate-900 dark:text-white">Unified Messages Hub</div>
        </div>
        <div className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">Message Requests • 2</div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
          <div className="p-3">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{FILTERS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => { setFilter(tab.id); setActiveRoomId(roomCatalog.find((r) => r.type === tab.id)?.id || roomCatalog[0].id); playTap(); }} className={`whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[10px] font-bold transition ${filter === tab.id ? "border-navy-700 bg-navy-800 text-white" : "border-slate-200 bg-white text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-200"}`}>{tab.label}</button>
            ))}</div>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto">
            {visibleRooms.map((room) => {
              const Icon = room.icon;
              const isSelected = room.id === activeRoomId;
              return (
                <button key={room.id} onClick={() => { playTap(); setActiveRoomId(room.id); }} className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${isSelected ? "bg-navy-50 dark:bg-navy-950/80 border border-navy-200/80 dark:border-navy-800/80 text-navy-900 dark:text-white" : "hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-slate-300"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-navy-800 text-amber-400" : "bg-white dark:bg-zinc-800 text-slate-500 border border-slate-200 dark:border-zinc-700"}`}><Icon className="w-5 h-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><span className="font-bold text-xs truncate">{room.title}</span><span className="text-[9px] rounded-full border border-slate-200 px-1.5 py-0.5 text-slate-500 dark:border-zinc-700 dark:text-slate-300">{room.tag}</span></div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{room.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900">
          <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:hidden"><button type="button" onClick={() => setFilter("all")} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 dark:border-zinc-700 dark:text-slate-300"><ArrowLeft className="h-4 w-4" /></button></div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{activeRoom.title}</h3>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Live Real-Time Navodayan Channel • {activeRoom.tag}</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">Active</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs"><MessageSquare className="w-8 h-8 mb-2 opacity-50" /><span>No messages in this thread yet. Say hello to your batchmates!</span></div>
            ) : (
              messages.map((msg) => {
                const isMine = user && msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 max-w-lg ${isMine ? "ml-auto flex-row-reverse" : ""}`}>
                    <img src={msg.sender_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} alt={msg.sender_name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-400" />
                    <div className={`p-3 rounded-2xl text-xs space-y-1 ${isMine ? "bg-navy-800 text-white rounded-tr-none" : "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-tl-none"}`}>
                      <div className="flex items-center justify-between gap-2 text-[10px] opacity-75"><span className="font-bold">{msg.sender_name}</span><span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200/80 dark:border-zinc-800 flex items-center gap-2 bg-slate-50/50 dark:bg-zinc-950/40">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={`Message ${activeRoom.title}...`} className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900 dark:text-white" />
            <button type="submit" className="p-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-xl shadow-xs transition-colors shrink-0" title="Send Message"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}
