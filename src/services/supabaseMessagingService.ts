import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ChatMessage } from "@/types";
import { fetchSupabaseProfile } from "@/services/supabaseProfileService";

function requireSupabase() {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase is not configured. Add its URL and anon key to .env.local.");
  return client;
}

export async function fetchConnectionIds(userId: string): Promise<string[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("connections")
    .select("requester_id, receiver_id")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "accepted");

  if (error) throw new Error(`Could not load connections: ${error.message}`);
  return (data || []).map((connection) =>
    connection.requester_id === userId ? connection.receiver_id : connection.requester_id
  );
}

export async function connectSupabaseProfile(userId: string, profileId: string): Promise<void> {
  if (userId === profileId) throw new Error("You cannot connect with your own profile.");
  const client = requireSupabase();
  const filter = `and(requester_id.eq.${userId},receiver_id.eq.${profileId}),and(requester_id.eq.${profileId},receiver_id.eq.${userId})`;
  const { data: existing, error: lookupError } = await client
    .from("connections")
    .select("id,status")
    .or(filter)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw new Error(`Could not check this connection: ${lookupError.message}`);
  if (existing?.status === "accepted") return;
  if (existing?.status === "pending") throw new Error("A connection request is already pending.");

  const { error } = await client.from("connections").insert({
    requester_id: userId,
    receiver_id: profileId,
    status: "accepted",
  });
  if (error) throw new Error(`Could not create connection: ${error.message}`);
}

export async function getOrCreateDirectRoom(profileId: string): Promise<string> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("get_or_create_direct_room", {
    other_user_id: profileId,
  });
  if (error) throw new Error(`Could not open direct chat: ${error.message}`);
  if (typeof data !== "string") throw new Error("Supabase returned an invalid direct chat room.");
  return data;
}

function mapMessage(row: Record<string, unknown>): ChatMessage {
  const sender = row.profiles as { full_name?: string; avatar_url?: string } | null;
  return {
    id: String(row.id),
    room_id: String(row.room_id),
    sender_id: String(row.sender_id),
    sender_name: sender?.full_name || "Navodayan",
    sender_avatar: sender?.avatar_url || "",
    content: String(row.content || ""),
    created_at: String(row.created_at),
  };
}

export async function fetchDirectMessages(roomId: string): Promise<ChatMessage[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("messages")
    .select("id,room_id,sender_id,content,created_at,profiles(full_name,avatar_url)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) throw new Error(`Could not load chat messages: ${error.message}`);
  return (data || []).map((row) => mapMessage(row as Record<string, unknown>));
}

export async function sendDirectMessage(roomId: string, content: string): Promise<ChatMessage> {
  const client = requireSupabase();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw new Error(authError?.message || "Sign in to send a message.");

  const { data, error } = await client
    .from("messages")
    .insert({ room_id: roomId, sender_id: user.id, content })
    .select("id,room_id,sender_id,content,created_at,profiles(full_name,avatar_url)")
    .single();

  if (error) throw new Error(`Could not send message: ${error.message}`);
  return mapMessage(data as Record<string, unknown>);
}

export function subscribeToDirectMessages(
  roomId: string,
  onMessage: (message: ChatMessage) => void,
  onError: (error: Error) => void
): RealtimeChannel {
  const client = requireSupabase();
  return client
    .channel(`direct-messages:${roomId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
      async ({ new: row }) => {
        try {
          const messageRow = row as Record<string, unknown>;
          const profile = await fetchSupabaseProfile(String(messageRow.sender_id));
          onMessage({
            ...mapMessage(messageRow),
            sender_name: profile?.full_name || "Navodayan",
            sender_avatar: profile?.avatar_url || "",
          });
        } catch (error) {
          onError(error instanceof Error ? error : new Error("Could not load the message sender's profile."));
        }
      }
    )
    .subscribe();
}
