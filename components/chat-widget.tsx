"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile, Image as ImageIcon, Trash2, MessageCircle, Users } from "lucide-react";
import { GiphyPicker } from "./giphy-picker";
import { StickerPicker } from "./sticker-picker";
import { createClient } from "@/lib/supabase";

interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  type: "text" | "gif" | "sticker";
  mediaUrl?: string;
}

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

  // Load username from localStorage and messages from database on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("chat_username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Check for admin auth (simple cookie check)
    const cookies = document.cookie.split(";");
    const hasAdminAuth = cookies.some((cookie) =>
      cookie.trim().startsWith("admin_auth=")
    );
    setIsAdmin(hasAdminAuth);

    // Load existing messages from database
    loadMessages();

    // Set up real-time subscription for new messages
    const supabase = createClient();
    const channel = supabase
      .channel('chat_messages_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMessage = payload.new;
          const message: Message = {
            id: newMessage.id,
            username: newMessage.username,
            content: newMessage.message || "",
            timestamp: new Date(newMessage.created_at),
            type: newMessage.gif_url ? "gif" : newMessage.sticker_url ? "sticker" : "text",
            mediaUrl: newMessage.gif_url || newMessage.sticker_url,
          };

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data && Array.isArray(data)) {
      const loadedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        username: msg.username,
        content: msg.message || "",
        timestamp: new Date(msg.created_at),
        type: msg.gif_url ? "gif" : msg.sticker_url ? "sticker" : "text",
        mediaUrl: msg.gif_url || msg.sticker_url,
      }));
      setMessages(loadedMessages);
    }
  };

  // Auto-scroll to bottom when new messages arrive
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

  // Prompt for username when user tries to send without one
  const requireUsername = () => {
    if (!username) {
      setShowUsernamePrompt(true);
      return false;
    }
    return true;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !username) return;

    const supabase = createClient();

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        username,
        message: inputMessage.trim(),
      } as any);

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    // Real-time subscription will add the message automatically
    setInputMessage("");
  };

  const handleGifSelect = async (gifUrl: string) => {
    if (!username) return;

    const supabase = createClient();

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        username,
        message: "",
        gif_url: gifUrl,
      } as any);

    if (error) {
      console.error("Error sending GIF:", error);
      return;
    }

    // Real-time subscription will add the message automatically
    setShowGiphyPicker(false);
  };

  const handleStickerSelect = async (stickerUrl: string) => {
    if (!username) return;

    const supabase = createClient();

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        username,
        message: "",
        sticker_url: stickerUrl,
      } as any);

    if (error) {
      console.error("Error sending sticker:", error);
      return;
    }

    // Real-time subscription will add the message automatically
    setShowStickerPicker(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error("Error deleting message:", error);
      return;
    }

    // Remove from local state immediately for instant feedback
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full h-full min-h-[500px] bg-card/50 backdrop-blur flex flex-col relative">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-brand-orange" />
            Chat en Vivo
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground font-normal">
            <Users className="h-4 w-4" />
            {messages.length > 0 ? `${messages.length} mensajes` : ""}
            {username && <span className="text-brand-orange">• {username}</span>}
          </span>
        </CardTitle>
      </CardHeader>

      {/* Username Prompt Modal */}
      {showUsernamePrompt && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur z-20 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-sm w-full">
            <h3 className="text-2xl font-bold">¡Únete al Chat!</h3>
            <p className="text-muted-foreground">
              Ingresa tu nombre para enviar mensajes
            </p>
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Tu nombre"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="text-lg h-12"
                maxLength={20}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setShowUsernamePrompt(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white"
                >
                  ¡Entrar!
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea
          ref={scrollRef}
          className="flex-1 p-4 space-y-3 overflow-y-auto"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-brand-orange text-sm">
                  {message.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.timestamp)}
                </span>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-5 w-5 ml-auto"
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {message.type === "text" && (
                <p className="text-sm text-foreground break-words">
                  {message.content}
                </p>
              )}

              {message.type === "gif" && message.mediaUrl && (
                <img
                  src={message.mediaUrl}
                  alt="GIF"
                  className="rounded-lg max-w-[200px] max-h-[200px] object-cover"
                />
              )}

              {message.type === "sticker" && message.mediaUrl && (
                <img
                  src={message.mediaUrl}
                  alt="Sticker"
                  className="w-24 h-24 object-contain"
                />
              )}
            </div>
          ))}
        </ScrollArea>

        {/* GIF Picker Modal */}
        {showGiphyPicker && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur z-10">
            <GiphyPicker
              onSelect={handleGifSelect}
              onClose={() => setShowGiphyPicker(false)}
            />
          </div>
        )}

        {/* Sticker Picker Modal */}
        {showStickerPicker && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur z-10">
            <StickerPicker
              onSelect={handleStickerSelect}
              onClose={() => setShowStickerPicker(false)}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          {!username ? (
            // Guest view - show join prompt
            <div className="flex items-center justify-center gap-3 py-2">
              <Button
                onClick={() => setShowUsernamePrompt(true)}
                size="lg"
                className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                ¡Únete al Chat!
              </Button>
            </div>
          ) : (
            // Logged in view - show message input
            <>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon-lg"
                  onClick={() => setShowStickerPicker(true)}
                  className="shrink-0"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-lg"
                  onClick={() => setShowGiphyPicker(true)}
                  className="shrink-0"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 h-12 text-base"
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white px-6"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
