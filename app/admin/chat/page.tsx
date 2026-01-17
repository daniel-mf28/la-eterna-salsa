// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Image as ImageIcon } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type ChatMessage = Database['public']['Tables']['chat_messages']['Row']

export default function ChatManagementPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel('chat_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        () => loadMessages()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      setMessages(data)
    }
    setLoading(false)
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', id)

    if (!error) {
      setMessages(messages.filter(m => m.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-600">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat Messages</h1>
        <p className="text-neutral-600">View and moderate chat messages</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages ({messages.length})</CardTitle>
          <CardDescription>Last 100 messages from the chat</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.username}</span>
                      <span className="text-xs text-neutral-500">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    {message.sticker_url && (
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <ImageIcon className="h-3 w-3" />
                        <span>Sticker attached</span>
                      </div>
                    )}
                    {message.gif_url && (
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <ImageIcon className="h-3 w-3" />
                        <span>GIF attached</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMessage(message.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
