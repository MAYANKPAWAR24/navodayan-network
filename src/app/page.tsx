"use client";

import React, { useState, useEffect } from "react";
import { PostComposer } from "@/features/wall/PostComposer";
import { CategoryFilterBar } from "@/features/wall/CategoryFilterBar";
import { PostCard } from "@/features/wall/PostCard";
import { dataService } from "@/services/dataService";
import { Post } from "@/types";
import { Sparkles, MessageSquare, Globe, HeartHandshake } from "lucide-react";
import { useSoundFX } from "@/context/SoundContext";

const quoteCards = [
  "Seven years in the same hostel, sharing the same mess plates, morning PT, and dreams—distance can never fade the Navodayan bond.",
  "From a rural district campus to leading the nation—every Navodayan carries a family across 660+ districts.",
  "Different batches, different states, four houses—one heartbeat: Navodaya.",
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const { playTap } = useSoundFX();

  useEffect(() => {
    setPosts(dataService.getPosts(activeCategory));
  }, [activeCategory]);

  const handlePostCreated = (newPost: Post) => setPosts((prev) => [newPost, ...prev]);
  const handlePostUpdated = (updatedPost: Post) => setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));

  return (
    <div className="space-y-5">
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 text-white shadow-lg shadow-navy-950/20 border border-navy-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Global Navodayan Assembly</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Built by Navodayans, For Navodayans — One Campus, One Bond, Forever.</h1>
            <p className="text-xs text-slate-300 max-w-lg mt-1 leading-relaxed">Connect with batchmates, find blood donors in your city, request mentorship, and share memories from your Navodaya journey.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-center px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15"><div className="text-base font-black text-amber-400">660+</div><div className="text-[10px] text-slate-300 font-semibold uppercase">JNV Campuses</div></div>
            <div className="text-center px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15"><div className="text-base font-black text-emerald-400">₹0</div><div className="text-[10px] text-slate-300 font-semibold uppercase">Free Forever</div></div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {quoteCards.map((quote) => (
          <div key={quote} className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm text-sm text-slate-700 dark:bg-zinc-900 dark:text-slate-200">
            <div className="mb-2 flex items-center gap-2 text-amber-600"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Brotherhood Quote</span></div>
            <p className="leading-relaxed">“{quote}”</p>
          </div>
        ))}
      </div>

      <PostComposer onPostCreated={handlePostCreated} />

      <CategoryFilterBar activeCategory={activeCategory} onSelectCategory={(cat) => { playTap(); setActiveCategory(cat); }} />

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mb-3"><MessageSquare className="w-6 h-6" /></div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No posts in this category yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Be the first to share a hostel memory, student update, or career question with fellow Navodayans!</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onPostUpdated={handlePostUpdated} />)
        )}
      </div>
    </div>
  );
}
