import Link from 'next/link'
import { Menu, Radio, MessageSquare, MessageCircleHeart, Sticker, Radio as StreamIcon, Users, ListMusic, HelpCircle, Share2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Radio },
  { href: '/admin/chat', label: 'Chat Messages', icon: MessageSquare },
  { href: '/admin/shoutouts', label: 'Shoutouts', icon: MessageCircleHeart },
  { href: '/admin/stickers', label: 'Stickers', icon: Sticker },
  { href: '/admin/stream', label: 'Stream Settings', icon: StreamIcon },
  { href: '/admin/djs', label: 'DJs', icon: Users },
  { href: '/admin/platforms', label: 'Platform Links', icon: ListMusic },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/social', label: 'Social Links', icon: Share2 },
  { href: '/admin/settings', label: 'Admin Settings', icon: Settings },
]

function Sidebar() {
  return (
    <div className="flex h-full flex-col bg-neutral-950 text-white">
      <div className="border-b border-neutral-800 p-6">
        <h1 className="text-2xl font-bold">La Eterna Salsa</h1>
        <p className="text-sm text-neutral-400">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-neutral-800 p-4">
        <Link href="/" className="block text-sm text-neutral-400 hover:text-white">
          View Public Site
        </Link>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 md:block">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <div className="flex w-full flex-col md:hidden">
        <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3">
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 overflow-auto bg-neutral-900 p-4">{children}</main>
      </div>

      {/* Desktop Content */}
      <main className="hidden flex-1 overflow-auto bg-neutral-900 p-8 md:block">
        {children}
      </main>
    </div>
  )
}
