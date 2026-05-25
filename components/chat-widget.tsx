"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Smile, Image as ImageIcon, Trash2, MessageCircle } from "lucide-react";
import { GiphyPicker } from "./giphy-picker";
import { StickerPicker } from "./sticker-picker";
import { createClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];
type ChatMessageInsert = Database["public"]["Tables"]["chat_messages"]["Insert"];

interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  type: "text" | "gif" | "sticker";
  mediaUrl?: string;
}

const toMessage = (msg: ChatMessageRow): Message => ({
  id: msg.id,
  username: msg.username,
  content: msg.message || "",
  timestamp: new Date(msg.created_at),
  type: msg.gif_url ? "gif" : msg.sticker_url ? "sticker" : "text",
  mediaUrl: msg.gif_url || msg.sticker_url || undefined,
});

export function ChatWidget() {
  const [username, setUsername] = useState<string>("");
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showGiphyPicker, setShowGiphyPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50);

    if (!error && data && Array.isArray(data)) {
      const loadedMessages: Message[] = data.map(toMessage);
      // Replace all messages; filter out optimistic ones now confirmed by server
      setMessages((prev) => {
        const optimistic = prev.filter((msg) => msg.id.startsWith("optimistic-"));
        if (optimistic.length === 0) return loadedMessages;
        // Keep optimistic messages not yet confirmed by server
        const serverIds = new Set(loadedMessages.map((m) => m.content + m.username));
        const stillPending = optimistic.filter(
          (msg) => !serverIds.has(msg.content + msg.username)
        );
        return [...loadedMessages, ...stillPending];
      });
    }
  }, []);

  // Initial setup: restore local state, load chat, then keep it current with Realtime.
  useEffect(() => {
    const storedUsername = localStorage.getItem("chat_username");
    if (storedUsername) {
      queueMicrotask(() => setUsername(storedUsername));
    }

    const cookies = document.cookie.split(";");
    const hasAdminAuth = cookies.some((cookie) =>
      cookie.trim().startsWith("admin_auth=")
    );
    queueMicrotask(() => setIsAdmin(hasAdminAuth));

    queueMicrotask(() => {
      loadMessages();
    });

    const supabase = createClient();
    const channel = supabase
      .channel("public_chat_messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    pollingRef.current = setInterval(() => {
      loadMessages();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername.trim()) {
      localStorage.setItem("chat_username", tempUsername.trim());
      setUsername(tempUsername.trim());
      setShowUsernamePrompt(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !username) return;

    const messageText = inputMessage.trim();
    const optimisticId = `optimistic-${Date.now()}`;

    // Optimistic insert — show immediately
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        username,
        content: messageText,
        timestamp: new Date(),
        type: "text",
      },
    ]);
    setInputMessage("");

    const supabase = createClient();
    const messageInsert: ChatMessageInsert = { username, message: messageText };
    const { error } = await supabase
      .from("chat_messages")
      .insert(messageInsert as never);

    if (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
    }
  };

  const handleGifSelect = async (gifUrl: string) => {
    if (!username) return;
    const supabase = createClient();
    const messageInsert: ChatMessageInsert = { username, message: "", gif_url: gifUrl };
    const { error } = await supabase
      .from("chat_messages")
      .insert(messageInsert as never);
    if (!error) setShowGiphyPicker(false);
  };

  const handleStickerSelect = async (stickerUrl: string) => {
    if (!username) return;
    const supabase = createClient();
    const messageInsert: ChatMessageInsert = { username, message: "", sticker_url: stickerUrl };
    const { error } = await supabase
      .from("chat_messages")
      .insert(messageInsert as never);
    if (!error) setShowStickerPicker(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId);
    if (!error) setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#C7C0AF]">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-[#0A3538]" />
          <span className="text-[13px] font-bold text-[#0E1817] uppercase tracking-wider">
            Chat en Vivo
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[11px] text-[#5B7368]">
            {messages.length > 0 ? messages.length : "0"}
          </span>
          {username && (
            <span className="text-[11px] text-[#C2491F] font-medium ml-1">
              {username}
            </span>
          )}
        </div>
      </div>

      {/* Username Prompt */}
      {showUsernamePrompt && (
        <div className="absolute inset-0 bg-[#FBF1E4]/95 backdrop-blur z-20 flex items-center justify-center p-4">
          <div className="text-center space-y-3 max-w-[280px] w-full">
            <h3 className="font-serif text-xl text-[#0A3538]">
              ¡Únete al Chat!
            </h3>
            <p className="text-[12px] text-[#5B7368]">
              Ingresa tu nombre para enviar mensajes
            </p>
            <form onSubmit={handleUsernameSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Tu nombre"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-[#C7C0AF] bg-white text-[13px] text-[#0E1817] placeholder:text-[#5B7368] focus:outline-none focus:ring-1 focus:ring-[#C2491F]"
                maxLength={20}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUsernamePrompt(false)}
                  className="flex-1 h-9 rounded-md border border-[#C7C0AF] text-[12px] font-medium text-[#5B7368] hover:bg-[#FCEED8] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-md bg-[#C2491F] text-[12px] font-bold text-white hover:bg-[#A33D1A] transition-colors"
                >
                  ¡Entrar!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-2">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-[#FAD09F] flex-shrink-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#0A3538]">
                {message.username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-bold text-[#0E1817]">
                  {message.username}
                </span>
                <span className="text-[10px] text-[#5B7368]">
                  {formatTime(message.timestamp)}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="ml-auto text-[#5B7368] hover:text-[#C2491F] transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>

              {message.type === "text" && (
                <p className="text-[11px] text-[#5B7368] break-words leading-relaxed">
                  {message.content}
                </p>
              )}
              {message.type === "gif" && message.mediaUrl && (
                <img
                  src={message.mediaUrl}
                  alt="GIF"
                  className="rounded-md max-w-[160px] max-h-[120px] object-cover mt-1"
                />
              )}
              {message.type === "sticker" && message.mediaUrl && (
                <img
                  src={message.mediaUrl}
                  alt="Sticker"
                  className="w-16 h-16 object-contain mt-1"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* GIF/Sticker Pickers */}
      {showGiphyPicker && (
        <div className="absolute inset-0 bg-[#FBF1E4]/95 backdrop-blur z-10">
          <GiphyPicker
            onSelect={handleGifSelect}
            onClose={() => setShowGiphyPicker(false)}
          />
        </div>
      )}
      {showStickerPicker && (
        <div className="absolute inset-0 bg-[#FBF1E4]/95 backdrop-blur z-10">
          <StickerPicker
            onSelect={handleStickerSelect}
            onClose={() => setShowStickerPicker(false)}
          />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#C7C0AF] px-4 py-2.5">
        {!username ? (
          <button
            onClick={() => setShowUsernamePrompt(true)}
            className="w-full h-9 rounded-md bg-[#1E5555] text-white text-[12px] font-bold hover:bg-[#0A3538] transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Únete al Chat
          </button>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setShowStickerPicker(true)}
                className="w-7 h-7 rounded flex items-center justify-center text-[#5B7368] hover:text-[#0A3538] hover:bg-[#FCEED8] transition-colors"
              >
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowGiphyPicker(true)}
                className="w-7 h-7 rounded flex items-center justify-center text-[#5B7368] hover:text-[#0A3538] hover:bg-[#FCEED8] transition-colors"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 h-8 px-3 rounded-md bg-white/60 border border-[#C7C0AF] text-[12px] text-[#0E1817] placeholder:text-[#5B7368] focus:outline-none focus:ring-1 focus:ring-[#C2491F]"
              maxLength={500}
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-md bg-[#1E5555] text-white flex items-center justify-center hover:bg-[#0A3538] transition-colors flex-shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
