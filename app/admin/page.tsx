import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, MessageCircleHeart, Sticker, Users } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()

  const [
    { count: chatCount },
    { count: shoutoutsCount },
    { count: pendingShoutoutsCount },
    { count: stickersCount },
    { count: djsCount },
  ] = await Promise.all([
    supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
    supabase.from('shoutouts').select('*', { count: 'exact', head: true }),
    supabase.from('shoutouts').select('*', { count: 'exact', head: true }).eq('approved', false),
    supabase.from('stickers').select('*', { count: 'exact', head: true }),
    supabase.from('djs').select('*', { count: 'exact', head: true }),
  ])

  return {
    chatMessages: chatCount || 0,
    totalShoutouts: shoutoutsCount || 0,
    pendingShoutouts: pendingShoutoutsCount || 0,
    stickers: stickersCount || 0,
    djs: djsCount || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-400">Welcome to La Eterna Salsa admin panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Chat Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.chatMessages}</div>
            <p className="text-xs text-neutral-400">Total messages sent</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Shoutouts</CardTitle>
            <MessageCircleHeart className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingShoutouts}</div>
            <p className="text-xs text-neutral-400">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Shoutouts</CardTitle>
            <MessageCircleHeart className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalShoutouts}</div>
            <p className="text-xs text-neutral-400">All shoutouts received</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Stickers</CardTitle>
            <Sticker className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.stickers}</div>
            <p className="text-xs text-neutral-400">Available stickers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-neutral-400">Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/shoutouts"
              className="block rounded-lg border border-neutral-800 p-3 transition-colors hover:bg-neutral-800"
            >
              <div className="font-medium text-white">Review Shoutouts</div>
              <div className="text-sm text-neutral-400">
                {stats.pendingShoutouts} pending approval
              </div>
            </a>
            <a
              href="/admin/chat"
              className="block rounded-lg border border-neutral-800 p-3 transition-colors hover:bg-neutral-800"
            >
              <div className="font-medium text-white">Moderate Chat</div>
              <div className="text-sm text-neutral-400">View and manage chat messages</div>
            </a>
            <a
              href="/admin/stream"
              className="block rounded-lg border border-neutral-800 p-3 transition-colors hover:bg-neutral-800"
            >
              <div className="font-medium text-white">Update Stream</div>
              <div className="text-sm text-neutral-400">Change stream URL or playlists</div>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Content Management</CardTitle>
            <CardDescription className="text-neutral-400">Manage site content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/djs"
              className="block rounded-lg border border-neutral-800 p-3 transition-colors hover:bg-neutral-800"
            >
              <div className="font-medium text-white">Manage DJs</div>
              <div className="text-sm text-neutral-400">{stats.djs} DJs configured</div>
            </a>
            <a
              href="/admin/faqs"
              className="block rounded-lg border border-neutral-800 p-3 transition-colors hover:bg-neutral-800"
            >
              <div className="font-medium text-white">Edit FAQs</div>
              <div className="text-sm text-neutral-400">Update frequently asked questions</div>
            </a>
            <a
              href="/admin/platforms"
              className="block rounded-lg border border-neutral-800 p-3 transition-colors hover:bg-neutral-800"
            >
              <div className="font-medium text-white">Platform Links</div>
              <div className="text-sm text-neutral-400">Manage TuneIn, radio.net links</div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
