"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, GraduationCap, Users, MapPin, Send, ArrowLeft, UserRound } from "lucide-react";
import { dataService } from "@/services/dataService";
import { useAuth } from "@/context/AuthContext";
import { useSoundFX } from "@/context/SoundContext";
import { ChatMessage } from "@/types";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchSupabaseProfile } from "@/services/supabaseProfileService";
import {
  fetchConnectionIds,
  fetchDirectMessages,
  getOrCreateDirectRoom,
  sendDirectMessage,
  subscribeToDirectMessages,
} from "@/services/supabaseMessagingService";

const FILTERS = [
  { id: "all", label: "All Chats" },
  { id: "direct", label: "Direct Messages (1-on-1)" },
  { id: "groups", label: "Groups (School / Batch / City / House)" },
] as const;

const roomCatalog = [
  { id: "school-1", title: "JNV Shimla Official Chapter", type: "groups", tag: "School", icon: GraduationCap, subtitle: "Alumni & Campus Community" },
  { id: "batch-2015", title: "Batch of 2015 National Circle", type: "groups", tag: "Batch", icon: Users, subtitle: "Passout Batchmates Across 660+ JNVs" },
  { id: "city-bengaluru", title: "Bengaluru Navodayan Chapter", type: "groups", tag: "City", icon: MapPin, subtitle: "Local Meetup & Coffee Circle" },
];

type ChatRoom = (typeof roomCatalog)[number] & { profile_id?: string };

function MessagesHub() {
  const searchParams = useSearchParams();
  const { user, requireAuth, isSupabaseConfigured } = useAuth();
  const { playTap, playSuccess } = useSoundFX();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [rooms, setRooms] = useState<ChatRoom[]>(roomCatalog);
  const [activeRoomId, setActiveRoomId] = useState("school-1");
  const [isMobileThreadOpen, setIsMobileThreadOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => dataService.getMessages("school-1"));
  const [inputText, setInputText] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const targetUserId = searchParams.get("user");

  const visibleRooms = useMemo(
    () => rooms.filter((room) => filter === "all" || room.type === filter),
    [filter, rooms]
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    let active = true;
    const loadConnections = async () => {
      try {
        const profileIds = await fetchConnectionIds(user.id);
        const connectedRooms = await Promise.all(profileIds.map(async (profileId) => {
          const profile = await fetchSupabaseProfile(profileId);
          if (!profile) return null;
          const roomId = await getOrCreateDirectRoom(profileId);
          return {
            id: roomId,
            title: profile.full_name,
            type: "direct",
            tag: "1-on-1",
            icon: UserRound,
            subtitle: `${profile.jnv_school_name || "Navodayan"} • Class of ${profile.passing_year}`,
            profile_id: profile.id,
          } satisfies ChatRoom;
        }));
        if (!active) return;
        setRooms((current) => {
          const byId = new Map(current.map((room) => [room.id, room]));
          connectedRooms.forEach((room) => {
            if (room) byId.set(room.id, room);
          });
          return Array.from(byId.values());
        });
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Could not load your connections.");
      }
    };
    void loadConnections();
    return () => { active = false; };
  }, [isSupabaseConfigured, user]);

  useEffect(() => {
    if (!targetUserId || !user || targetUserId === user.id) return;
    let active = true;
    const openDirectRoom = async () => {
      try {
        const target = isSupabaseConfigured
          ? await fetchSupabaseProfile(targetUserId)
          : dataService.getProfileById(targetUserId);
        if (!target) throw new Error("This Navodayan profile could not be found.");

        const roomId = isSupabaseConfigured
          ? await getOrCreateDirectRoom(target.id)
          : `dm-${[user.id, target.id].sort().join("--")}`;
        if (!active) return;
        const directRoom: ChatRoom = {
          id: roomId,
          title: target.full_name,
          type: "direct",
          tag: "1-on-1",
          icon: UserRound,
          subtitle: `${target.jnv_school_name || "Navodayan"} • Class of ${target.passing_year}`,
          profile_id: target.id,
        };
        setRooms((current) => current.some((room) => room.id === roomId) ? current : [directRoom, ...current]);
        setFilter("direct");
        setActiveRoomId(roomId);
        setIsMobileThreadOpen(true);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Could not open this direct chat.");
      }
    };
    void openDirectRoom();
    return () => { active = false; };
  }, [targetUserId, user, isSupabaseConfigured]);

  useEffect(() => {
    const room = rooms.find((item) => item.id === activeRoomId);
    if (room?.type !== "direct" || !isSupabaseConfigured) {
      setMessages(dataService.getMessages(activeRoomId));
      return;
    }

    let active = true;
    setMessages([]);
    const loadMessages = async () => {
      try {
        const initialMessages = await fetchDirectMessages(activeRoomId);
        if (active) setMessages(initialMessages);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Could not load chat messages.");
      }
    };
    void loadMessages();

    const channel = subscribeToDirectMessages(activeRoomId, (message) => {
      if (!active) return;
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
    }, (error) => {
      if (active) toast.error(error.message);
    });
    return () => {
      active = false;
      const client = getSupabaseBrowserClient();
      if (client) void client.removeChannel(channel);
    };
  }, [activeRoomId, rooms, isSupabaseConfigured]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText.trim()) return;
    requireAuth(() => {
      const content = inputText.trim();
      if (activeRoom?.type === "direct" && isSupabaseConfigured) {
        const optimisticId = `optimistic-${Date.now()}`;
        const optimisticMessage: ChatMessage = {
          id: optimisticId,
          room_id: activeRoomId,
          sender_id: user?.id || "",
          sender_name: user?.full_name || "You",
          sender_avatar: user?.avatar_url,
          content,
          created_at: new Date().toISOString(),
        };
        setMessages((current) => [...current, optimisticMessage]);
        setInputText("");
        void sendDirectMessage(activeRoomId, content).then((message) => {
          setMessages((current) => current.map((item) => item.id === optimisticId ? message : item));
          playSuccess();
        }).catch((error: unknown) => {
          setMessages((current) => current.filter((item) => item.id !== optimisticId));
          toast.error(error instanceof Error ? error.message : "Could not send your message.");
        });
      } else {
        const message = dataService.sendMessage(activeRoomId, content);
        setMessages((current) => [...current, message]);
        setInputText("");
        playSuccess();
      }
    });
  };

  const activeRoom = rooms.find((room) => room.id === activeRoomId) || rooms[0];

  return (
    <div className="flex h-[calc(100dvh-11rem)] min-h-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900 md:h-[calc(100vh-10rem)]">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500"><MessageSquare className="h-3.5 w-3.5 text-amber-500" /> Messages</div>
          <div className="mt-1 text-base font-black text-slate-900 dark:text-white">Your conversations</div>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">Direct &amp; group chats</span>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className={`w-full overflow-y-auto border-slate-200/80 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-950/30 md:block md:w-80 md:shrink-0 md:border-r ${isMobileThreadOpen ? "hidden" : "block"}`}>
          <div className="p-3">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
              {FILTERS.map((tab) => (
                <button key={tab.id} type="button" onClick={() => { setFilter(tab.id); playTap(); }} className={`whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[10px] font-bold transition ${filter === tab.id ? "border-navy-700 bg-navy-800 text-white" : "border-slate-200 bg-white text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-200"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1 p-2">
            {visibleRooms.map((room) => {
              const Icon = room.icon;
              const selected = room.id === activeRoomId;
              return (
                <button key={room.id} onClick={() => { playTap(); setActiveRoomId(room.id); setIsMobileThreadOpen(true); }} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${selected ? "border border-navy-200/80 bg-navy-50 text-navy-900 dark:border-navy-800/80 dark:bg-navy-950/80 dark:text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800/60"}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-navy-800 text-amber-400" : "border border-slate-200 bg-white text-slate-500 dark:border-zinc-700 dark:bg-zinc-800"}`}><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-bold">{room.title}</span><span className="rounded-full border border-slate-200 px-1.5 py-0.5 text-[9px] text-slate-500 dark:border-zinc-700 dark:text-slate-300">{room.tag}</span></div>
                    <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">{room.subtitle}</div>
                  </div>
                </button>
              );
            })}
            {visibleRooms.length === 0 && <p className="px-3 py-8 text-center text-xs text-slate-500">No chats in this filter yet. Connect with a Navodayan to start a DM.</p>}
          </div>
        </aside>

        <section className={`${isMobileThreadOpen ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col bg-white dark:bg-zinc-900`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 p-4 dark:border-zinc-800">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" onClick={() => setIsMobileThreadOpen(false)} aria-label="Back to conversations" className="rounded-lg border border-slate-200 p-1.5 text-slate-600 dark:border-zinc-700 dark:text-slate-300 md:hidden"><ArrowLeft className="h-4 w-4" /></button>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{activeRoom.title}</h3>
                <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">{activeRoom.type === "direct" ? activeRoom.subtitle : `Community group • ${activeRoom.tag}`}</div>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{activeRoom.type === "direct" ? "Private DM" : "Group"}</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-slate-400"><MessageSquare className="mb-2 h-8 w-8 opacity-50" /><span>No messages yet. Say hello to {activeRoom.type === "direct" ? activeRoom.title : "your Navodayan group"}.</span></div>
            ) : messages.map((message) => {
              const isMine = user && message.sender_id === user.id;
              return (
                <div key={message.id} className={`flex max-w-lg items-start gap-2.5 ${isMine ? "ml-auto flex-row-reverse" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={message.sender_avatar || "/icon"} alt="" className="h-8 w-8 shrink-0 rounded-full border border-amber-400 object-cover" />
                  <div className={`space-y-1 rounded-2xl p-3 text-xs ${isMine ? "rounded-tr-none bg-navy-800 text-white" : "rounded-tl-none bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white"}`}>
                    <div className="flex items-center justify-between gap-2 text-[10px] opacity-75"><span className="font-bold">{message.sender_name}</span><span>{hasMounted ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span></div>
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-slate-200/80 bg-slate-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
            <input type="text" value={inputText} onChange={(event) => setInputText(event.target.value)} placeholder={`Message ${activeRoom.title}...`} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:text-sm" />
            <button type="submit" className="shrink-0 rounded-xl bg-navy-800 p-2.5 text-white shadow-xs transition-colors hover:bg-navy-900" title="Send message" aria-label="Send message"><Send className="h-4 w-4" /></button>
          </form>
          <p className="px-3 pb-2 text-center text-[9px] text-slate-400">{activeRoom.type === "direct" && isSupabaseConfigured ? "Private messages are securely stored in your Supabase project." : "Group conversations are still demo-only; direct messages are server-backed."}</p>
        </section>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-zinc-900" />}>
      <MessagesHub />
    </Suspense>
  );
}
