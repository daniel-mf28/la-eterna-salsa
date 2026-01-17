// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Plus, Edit, MoveUp, MoveDown } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type PlatformLink = Database['public']['Tables']['platform_links']['Row']

export default function PlatformLinksPage() {
  const [links, setLinks] = useState<PlatformLink[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<PlatformLink | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    url: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    const { data, error } = await supabase
      .from('platform_links')
      .select('*')
      .order('display_order', { ascending: true })

    if (!error && data) {
      setLinks(data)
    }
    setLoading(false)
  }

  const openDialog = (link?: PlatformLink) => {
    if (link) {
      setEditingLink(link)
      setFormData({
        name: link.name,
        icon: link.icon,
        url: link.url,
      })
    } else {
      setEditingLink(null)
      setFormData({
        name: '',
        icon: '',
        url: '',
      })
    }
    setDialogOpen(true)
  }

  const saveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingLink) {
        const { data, error } = await supabase
          .from('platform_links')
          .update(formData)
          .eq('id', editingLink.id)
          .select()
          .single()

        if (!error && data) {
          setLinks(links.map(l => l.id === data.id ? data : l))
        }
      } else {
        const { data, error } = await supabase
          .from('platform_links')
          .insert([{ ...formData, display_order: links.length }])
          .select()
          .single()

        if (!error && data) {
          setLinks([...links, data])
        }
      }

      setDialogOpen(false)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this platform link?')) return

    const { error } = await supabase
      .from('platform_links')
      .delete()
      .eq('id', id)

    if (!error) {
      setLinks(links.filter(l => l.id !== id))
    }
  }

  const moveLink = async (id: string, direction: 'up' | 'down') => {
    const index = links.findIndex(l => l.id === id)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === links.length - 1)
    ) return

    const newLinks = [...links]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]]

    // Update display_order
    for (let i = 0; i < newLinks.length; i++) {
      await supabase
        .from('platform_links')
        .update({ display_order: i })
        .eq('id', newLinks[i].id)
      newLinks[i].display_order = i
    }

    setLinks(newLinks)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-600">Loading platform links...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Links</h1>
          <p className="text-neutral-600">Manage TuneIn, radio.net, and other platform links</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Platform
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLink ? 'Edit Platform Link' : 'Add Platform Link'}</DialogTitle>
              <DialogDescription>
                Add a link to listen on another platform
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={saveLink} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Platform Name *
                </label>
                <Input
                  id="name"
                  placeholder="TuneIn"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="icon" className="text-sm font-medium">
                  Icon Name *
                </label>
                <Input
                  id="icon"
                  placeholder="radio"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  required
                />
                <p className="text-xs text-neutral-600">
                  Lucide icon name (e.g., radio, music, headphones)
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Platform URL *
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://tunein.com/radio/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Saving...' : editingLink ? 'Update Link' : 'Add Link'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Links ({links.length})</CardTitle>
          <CardDescription>Reorder, edit, or delete platform links</CardDescription>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">No platform links yet</p>
          ) : (
            <div className="space-y-3">
              {links.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveLink(link.id, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveLink(link.id, 'down')}
                      disabled={index === links.length - 1}
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">{link.name}</h3>
                    <p className="text-sm text-neutral-600 truncate">{link.url}</p>
                    <p className="text-xs text-neutral-500">Icon: {link.icon}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDialog(link)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
