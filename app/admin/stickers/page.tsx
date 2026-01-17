// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Plus } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Sticker = Database['public']['Tables']['stickers']['Row']

export default function StickersPage() {
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newSticker, setNewSticker] = useState({ name: '', image_url: '' })
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadStickers()
  }, [])

  const loadStickers = async () => {
    const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setStickers(data)
    }
    setLoading(false)
  }

  const addSticker = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data, error } = await supabase
      .from('stickers')
      .insert([newSticker])
      .select()
      .single()

    if (!error && data) {
      setStickers([data, ...stickers])
      setNewSticker({ name: '', image_url: '' })
      setDialogOpen(false)
    }
    setSubmitting(false)
  }

  const deleteSticker = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sticker?')) return

    const { error } = await supabase
      .from('stickers')
      .delete()
      .eq('id', id)

    if (!error) {
      setStickers(stickers.filter(s => s.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-600">Loading stickers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stickers</h1>
          <p className="text-neutral-600">Manage chat stickers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Sticker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Sticker</DialogTitle>
              <DialogDescription>
                Upload a sticker image and give it a name
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addSticker} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Sticker Name
                </label>
                <Input
                  id="name"
                  placeholder="Happy Dance"
                  value={newSticker.name}
                  onChange={(e) => setNewSticker({ ...newSticker, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="image_url" className="text-sm font-medium">
                  Image URL
                </label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/sticker.png"
                  value={newSticker.image_url}
                  onChange={(e) => setNewSticker({ ...newSticker, image_url: e.target.value })}
                  required
                />
                <p className="text-xs text-neutral-600">
                  Upload your image to Supabase Storage or use an external URL
                </p>
              </div>
              {newSticker.image_url && (
                <div className="rounded border border-neutral-200 p-4">
                  <img
                    src={newSticker.image_url}
                    alt="Preview"
                    className="h-24 w-24 object-contain mx-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Sticker'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stickers ({stickers.length})</CardTitle>
          <CardDescription>Available stickers for chat</CardDescription>
        </CardHeader>
        <CardContent>
          {stickers.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">No stickers yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="group relative rounded-lg border border-neutral-200 p-4 hover:border-neutral-300"
                >
                  <img
                    src={sticker.image_url}
                    alt={sticker.name}
                    className="h-20 w-20 object-contain mx-auto"
                  />
                  <p className="mt-2 text-center text-xs text-neutral-600 truncate">
                    {sticker.name}
                  </p>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteSticker(sticker.id)}
                  >
                    <Trash2 className="h-3 w-3" />
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
