// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Trash2, MapPin } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Shoutout = Database['public']['Tables']['shoutouts']['Row']

export default function ShoutoutsPage() {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
  const supabase = createClient()

  useEffect(() => {
    loadShoutouts()

    // Subscribe to changes
    const channel = supabase
      .channel('shoutouts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shoutouts' },
        () => loadShoutouts()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  const loadShoutouts = async () => {
    let query = supabase
      .from('shoutouts')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter === 'pending') {
      query = query.eq('approved', false)
    } else if (filter === 'approved') {
      query = query.eq('approved', true)
    }

    const { data, error } = await query

    if (!error && data) {
      setShoutouts(data)
    }
    setLoading(false)
  }

  const approveShoutout = async (id: string) => {
    const { error } = await supabase
      .from('shoutouts')
      .update({ approved: true })
      .eq('id', id)

    if (!error) {
      setShoutouts(shoutouts.map(s => s.id === id ? { ...s, approved: true } : s))
    }
  }

  const deleteShoutout = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shoutout?')) return

    const { error } = await supabase
      .from('shoutouts')
      .delete()
      .eq('id', id)

    if (!error) {
      setShoutouts(shoutouts.filter(s => s.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-600">Loading shoutouts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shoutouts</h1>
        <p className="text-neutral-600">Review and approve listener shoutouts</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Approved
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shoutouts ({shoutouts.length})</CardTitle>
          <CardDescription>
            {filter === 'pending' && 'Pending approval'}
            {filter === 'approved' && 'Approved shoutouts'}
            {filter === 'all' && 'All shoutouts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shoutouts.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">
              No {filter === 'all' ? '' : filter} shoutouts
            </p>
          ) : (
            <div className="space-y-4">
              {shoutouts.map((shoutout) => (
                <div
                  key={shoutout.id}
                  className="rounded-lg border border-neutral-200 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{shoutout.name}</span>
                        {shoutout.approved ? (
                          <Badge variant="default" className="bg-green-600">
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                      {(shoutout.city || shoutout.country) && (
                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {[shoutout.city, shoutout.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                      <p className="text-sm">{shoutout.message}</p>
                      {shoutout.song_request && (
                        <div className="rounded bg-neutral-100 p-2 text-sm text-neutral-900">
                          <span className="font-medium">Song Request:</span> {shoutout.song_request}
                        </div>
                      )}
                      <span className="text-xs text-neutral-500">
                        {new Date(shoutout.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {!shoutout.approved && (
                        <Button
                          variant="default"
                          size="icon"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveShoutout(shoutout.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteShoutout(shoutout.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
