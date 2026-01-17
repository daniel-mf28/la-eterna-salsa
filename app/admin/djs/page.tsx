// @ts-nocheck - Supabase type inference needs env vars at build time
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Plus, Edit, MoveUp, MoveDown } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type DJ = Database['public']['Tables']['djs']['Row']

export default function DJsPage() {
  const [djs, setDjs] = useState<DJ[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDJ, setEditingDJ] = useState<DJ | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    photo_url: '',
    schedule: '',
    bio: '',
    social_links: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadDJs()
  }, [])

  const loadDJs = async () => {
    const { data, error } = await supabase
      .from('djs')
      .select('*')
      .order('display_order', { ascending: true })

    if (!error && data) {
      setDjs(data)
    }
    setLoading(false)
  }

  const openDialog = (dj?: DJ) => {
    if (dj) {
      setEditingDJ(dj)
      setFormData({
        name: dj.name,
        photo_url: dj.photo_url || '',
        schedule: dj.schedule || '',
        bio: dj.bio || '',
        social_links: dj.social_links ? JSON.stringify(dj.social_links, null, 2) : '',
      })
    } else {
      setEditingDJ(null)
      setFormData({
        name: '',
        photo_url: '',
        schedule: '',
        bio: '',
        social_links: '',
      })
    }
    setDialogOpen(true)
  }

  const saveDJ = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const djData: Database['public']['Tables']['djs']['Update'] = {
        name: formData.name,
        photo_url: formData.photo_url || null,
        schedule: formData.schedule || null,
        bio: formData.bio || null,
        social_links: formData.social_links ? JSON.parse(formData.social_links) : null,
      }

      if (editingDJ) {
        const { data, error } = await supabase
          .from('djs')
          .update(djData)
          .eq('id', editingDJ.id)
          .select()
          .single()

        if (!error && data) {
          setDjs(djs.map(d => d.id === data.id ? data : d))
        }
      } else {
        const insertData = {
          ...djData,
          name: formData.name,
          display_order: djs.length
        }
        const { data, error } = await supabase
          .from('djs')
          .insert([insertData])
          .select()
          .single()

        if (!error && data) {
          setDjs([...djs, data])
        }
      }

      setDialogOpen(false)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteDJ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this DJ?')) return

    const { error } = await supabase
      .from('djs')
      .delete()
      .eq('id', id)

    if (!error) {
      setDjs(djs.filter(d => d.id !== id))
    }
  }

  const moveDJ = async (id: string, direction: 'up' | 'down') => {
    const index = djs.findIndex(d => d.id === id)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === djs.length - 1)
    ) return

    const newDJs = [...djs]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newDJs[index], newDJs[targetIndex]] = [newDJs[targetIndex], newDJs[index]]

    // Update display_order
    for (let i = 0; i < newDJs.length; i++) {
      await supabase
        .from('djs')
        .update({ display_order: i })
        .eq('id', newDJs[i].id)
      newDJs[i].display_order = i
    }

    setDjs(newDJs)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-600">Loading DJs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DJs</h1>
          <p className="text-neutral-600">Manage radio station DJs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add DJ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDJ ? 'Edit DJ' : 'Add New DJ'}</DialogTitle>
              <DialogDescription>
                Enter DJ information and social media links
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={saveDJ} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name *
                </label>
                <Input
                  id="name"
                  placeholder="DJ Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="photo_url" className="text-sm font-medium">
                  Photo URL
                </label>
                <Input
                  id="photo_url"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="schedule" className="text-sm font-medium">
                  Schedule
                </label>
                <Input
                  id="schedule"
                  placeholder="Monday - Friday, 6AM - 10AM"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  placeholder="DJ biography..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="social_links" className="text-sm font-medium">
                  Social Links (JSON)
                </label>
                <Textarea
                  id="social_links"
                  placeholder='{"instagram": "username", "twitter": "username"}'
                  value={formData.social_links}
                  onChange={(e) => setFormData({ ...formData, social_links: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-neutral-600">
                  Enter as JSON object with platform names as keys
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Saving...' : editingDJ ? 'Update DJ' : 'Add DJ'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DJs ({djs.length})</CardTitle>
          <CardDescription>Drag to reorder, click to edit</CardDescription>
        </CardHeader>
        <CardContent>
          {djs.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">No DJs yet</p>
          ) : (
            <div className="space-y-3">
              {djs.map((dj, index) => (
                <div
                  key={dj.id}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveDJ(dj.id, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveDJ(dj.id, 'down')}
                      disabled={index === djs.length - 1}
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {dj.photo_url && (
                    <img
                      src={dj.photo_url}
                      alt={dj.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-medium">{dj.name}</h3>
                    {dj.schedule && (
                      <p className="text-sm text-neutral-600">{dj.schedule}</p>
                    )}
                    {dj.bio && (
                      <p className="text-sm text-neutral-600 line-clamp-2">{dj.bio}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDialog(dj)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteDJ(dj.id)}
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
