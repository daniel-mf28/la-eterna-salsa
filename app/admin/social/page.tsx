// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Plus, Edit } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type SocialLink = Database['public']['Tables']['social_links']['Row']

export default function SocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const platforms = [
    'Facebook',
    'Instagram',
    'Twitter',
    'YouTube',
    'TikTok',
    'WhatsApp',
    'Telegram',
    'LinkedIn',
  ]

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setLinks(data)
    }
    setLoading(false)
  }

  const openDialog = (link?: SocialLink) => {
    if (link) {
      setEditingLink(link)
      setFormData({
        platform: link.platform,
        url: link.url,
      })
    } else {
      setEditingLink(null)
      setFormData({
        platform: '',
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
          .from('social_links')
          .update(formData)
          .eq('id', editingLink.id)
          .select()
          .single()

        if (!error && data) {
          setLinks(links.map(l => l.id === data.id ? data : l))
        }
      } else {
        const { data, error } = await supabase
          .from('social_links')
          .insert([formData])
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
    if (!confirm('Are you sure you want to delete this social link?')) return

    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id)

    if (!error) {
      setLinks(links.filter(l => l.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-600">Loading social links...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Links</h1>
          <p className="text-neutral-600">Manage social media links</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Social Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLink ? 'Edit Social Link' : 'Add Social Link'}</DialogTitle>
              <DialogDescription>
                Add a link to your social media profile
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={saveLink} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="platform" className="text-sm font-medium">
                  Platform *
                </label>
                <select
                  id="platform"
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  required
                >
                  <option value="">Select platform</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Profile URL *
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://facebook.com/laeternasalsa"
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
          <CardTitle>Social Links ({links.length})</CardTitle>
          <CardDescription>Your social media profiles</CardDescription>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">No social links yet</p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{link.platform}</h3>
                    <p className="text-sm text-neutral-600 truncate">{link.url}</p>
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
