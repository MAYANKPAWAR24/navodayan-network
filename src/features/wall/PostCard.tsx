"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSoundFX } from "@/context/SoundContext";
import { dataService } from "@/services/dataService";
import {
  MessageCircle,
  Share2,
  Flag,
  Shield,
  Send,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PostCardProps {
  post: Post;
  onPostUpdated: (post: Post) => void;
}

export function PostCard({ post, onPostUpdated }: PostCardProps) {
  const { user, requireAuth } = useAuth();
  const { playPop, playTap, playSuccess } = useSoundFX();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Poll percentage calculator
  const totalVotes =
    post.poll_data?.options.reduce((acc, opt) => acc + opt.votes.length, 0) || 0;

  const handleReaction = (type: string) => {
    requireAuth(() => {
      playPop();
      const updated = dataService.reactToPost(post.id, type);
      if (updated) onPostUpdated(updated);
    });
  };

  const handleVote = (optionIndex: number) => {
    requireAuth(() => {
      playPop();
      const updated = dataService.votePoll(post.id, optionIndex);
      if (updated) {
        toast.success("Poll vote recorded!");
        onPostUpdated(updated);
      }
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(() => {
      if (!commentText.trim()) return;
      try {
        const updated = dataService.addComment(post.id, commentText.trim());
        if (updated) {
          playSuccess();
          setCommentText("");
          onPostUpdated(updated);
          toast.success("Comment added!");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error adding comment";
        toast.error(message);
      }
    });
  };

  const handleReport = () => {
    requireAuth(() => {
      const reason = window.prompt("Why are you reporting this post? (Harassment, spam, or non-Navodayan content)");
      if (!reason) return;

      const success = dataService.reportItem("post", post.id, reason);
      if (success) {
        playTap();
        toast.success("Report submitted. Post will auto-hide if flagged by 10 members.");
      } else {
        toast.error("You have already reported this post.");
      }
    });
  };

  const handleShare = () => {
    playPop();
    const text = encodeURIComponent(
      `Check out this story from ${post.author_school || "The Navodayan Network"}: https://navodayan.org`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success("Share link opened!");
  };

  const isSafe = post.is_safe_space || post.category === "safe_space";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all ${
        isSafe
          ? "bg-purple-50/40 dark:bg-zinc-900 border-purple-200/70 dark:border-purple-900/30"
          : "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-white/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {post.is_anonymous ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              alt="Anonymous member"
              className="h-10 w-10 shrink-0 rounded-full object-cover opacity-70 blur-xs"
            />
          ) : (
            <Link href={`/profile/${post.author_id}`} aria-label={`View ${post.author_name}'s profile`} className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={post.author_name}
                className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-zinc-700"
              />
            </Link>
          )}
          <div>
            <div className="flex items-center gap-2">
              {post.is_anonymous ? (
                <span className="font-bold text-sm text-slate-900 dark:text-white">{post.author_name}</span>
              ) : (
                <Link href={`/profile/${post.author_id}`} className="font-bold text-sm text-slate-900 hover:text-navy-700 dark:text-white dark:hover:text-blue-300">
                  {post.author_name}
                </Link>
              )}
              {post.author_uid && (
                <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                  {post.author_uid}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{post.author_school}</span>
              {post.author_batch && (
                <>
                  <span>•</span>
                  <span>Batch of {post.author_batch}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Pill */}
        <div className="flex items-center gap-1.5">
          {isSafe ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25">
              <Shield className="w-3 h-3" />
              <span>Safe Space</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 capitalize">
              {post.category.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line mb-3">
        {post.content}
      </p>

      {/* Media Image */}
      {post.media_urls && post.media_urls.length > 0 && post.media_urls[0] && (
        <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 max-h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.media_urls[0]}
            alt="Post attachment"
            className="w-full h-auto object-cover hover:scale-101 transition-transform"
          />
        </div>
      )}

      {/* Interactive Poll */}
      {post.poll_data && post.poll_data.options.length > 0 && (
        <div className="my-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 space-y-2">
          {post.poll_data.question && (
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              📊 {post.poll_data.question}
            </div>
          )}

          <div className="space-y-2">
            {post.poll_data.options.map((opt, i) => {
              const voteCount = opt.votes.length;
              const percentage =
                totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const hasVoted = user && opt.votes.includes(user.id);

              return (
                <button
                  key={i}
                  onClick={() => handleVote(i)}
                  className={`relative w-full text-left p-2.5 rounded-xl border text-xs font-medium overflow-hidden transition-all ${
                    hasVoted
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {/* Animated Progress Bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute top-0 bottom-0 left-0 bg-amber-500/15 dark:bg-amber-500/20 -z-10"
                  />

                  <div className="flex items-center justify-between relative z-10">
                    <span className="truncate pr-2">
                      {hasVoted ? "✓ " : ""}
                      {opt.text}
                    </span>
                    <span className="font-bold text-[11px] shrink-0 text-slate-500 dark:text-slate-400">
                      {percentage}% ({voteCount})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 text-right pt-1">
            {totalVotes} total {totalVotes === 1 ? "vote" : "votes"}
          </div>
        </div>
      )}

      {/* Tactile Reaction Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isSafe ? (
            <>
              {/* Salute */}
              <button
                onClick={() => handleReaction("salute")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  post.user_reaction === "salute"
                    ? "bg-navy-100 dark:bg-navy-900/60 text-navy-800 dark:text-blue-300 border border-navy-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
                title="Salute"
              >
                <span>🫡</span>
                <span>{post.reactions?.salute || 0}</span>
              </button>

              {/* Nostalgia */}
              <button
                onClick={() => handleReaction("nostalgia")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  post.user_reaction === "nostalgia"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
                title="Nostalgia"
              >
                <span>🥺</span>
                <span>{post.reactions?.nostalgia || 0}</span>
              </button>

              {/* Proud JNV */}
              <button
                onClick={() => handleReaction("proud_jnv")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  post.user_reaction === "proud_jnv"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
                title="Proud JNV"
              >
                <span>🌟</span>
                <span>{post.reactions?.proud_jnv || 0}</span>
              </button>
            </>
          ) : (
            <>
              {/* Support Hug */}
              <button
                onClick={() => handleReaction("support_hug")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  post.user_reaction === "support_hug"
                    ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
                title="Support Hug"
              >
                <span>🫂</span>
                <span>{post.reactions?.support_hug || 0}</span>
              </button>

              {/* Stay Strong */}
              <button
                onClick={() => handleReaction("stay_strong")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  post.user_reaction === "stay_strong"
                    ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
                title="Stay Strong"
              >
                <span>💪</span>
                <span>{post.reactions?.stay_strong || 0}</span>
              </button>
            </>
          )}

          {/* Comments Toggle */}
          {!isSafe ? (
            <button
              onClick={() => {
                playTap();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.comments?.length || 0}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-semibold px-2">
              <Lock className="w-3 h-3" />
              <span>Comments Disabled</span>
            </div>
          )}
        </div>

        {/* Right Tools (Share & Report) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Share via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReport}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
            title="Report Post (10-Report Auto-Block)"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && !isSafe && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-3"
          >
            {/* List of comments */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <div className="font-bold text-[11px] text-slate-900 dark:text-white mb-0.5">
                      {c.author_name}
                    </div>
                    <p>{c.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-400 py-1 text-center">
                  Be the first to comment on this post!
                </div>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a supportive reply..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-navy-600 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="p-2 bg-navy-800 hover:bg-navy-900 text-white rounded-xl shadow-xs transition-colors"
                title="Send Comment"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
