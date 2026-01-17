// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Plus, X } from 'lucide-react'

export default function StreamSettingsPage() {
  const [settings, setSettings] = useState({
    stream_url: '',
    spotify_playlist_ids: '',
    youtube_playlist_id: '',
  })
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<string[]>([''])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', ['stream_url', 'spotify_playlist_ids', 'youtube_playlist_id'])

    if (!error && data) {
      const config = data.reduce((acc, { key, value }) => {
        acc[key as keyof typeof settings] = value
        return acc
      }, {} as typeof settings)

      // Parse Spotify playlist IDs
      if (config.spotify_playlist_ids) {
        try {
          const parsed = JSON.parse(config.spotify_playlist_ids)
          setSpotifyPlaylists(Array.isArray(parsed) && parsed.length > 0 ? parsed : [''])
        } catch {
          const ids = config.spotify_playlist_ids
            .split(',')
            .map((id: string) => id.trim())
            .filter(Boolean)
          setSpotifyPlaylists(ids.length > 0 ? ids : [''])
        }
      }

      setSettings({ ...settings, ...config })
    }
    setLoading(false)
  }

  const addPlaylistField = () => {
    setSpotifyPlaylists([...spotifyPlaylists, ''])
  }

  const removePlaylistField = (index: number) => {
    if (spotifyPlaylists.length > 1) {
      setSpotifyPlaylists(spotifyPlaylists.filter((_, i) => i !== index))
    }
  }

  const updatePlaylistId = (index: number, value: string) => {
    const newPlaylists = [...spotifyPlaylists]
    newPlaylists[index] = value
    setSpotifyPlaylists(newPlaylists)
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // Filter out empty playlist IDs
      const validPlaylists = spotifyPlaylists.filter(id => id.trim())

      // Convert to JSON array for storage
      const playlistIdsValue = JSON.stringify(validPlaylists)

      // Update stream URL and YouTube
      for (const [key, value] of Object.entries(settings)) {
        if (key !== 'spotify_playlist_ids') {
          const { error } = await supabase
            .from('site_config')
            .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

          if (error) throw error
        }
      }

      // Update Spotify playlists
      const { error } = await supabase
        .from('site_config')
        .upsert(
          {
            key: 'spotify_playlist_ids',
            value: playlistIdsValue,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        )

      if (error) throw error

      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-600">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stream Settings</h1>
        <p className="text-neutral-600">Configure stream URL and playlist links</p>
      </div>

      <form onSubmit={saveSettings} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Stream Configuration</CardTitle>
            <CardDescription>Main radio stream URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="stream_url" className="text-sm font-medium">
                Stream URL
              </label>
              <Input
                id="stream_url"
                type="url"
                placeholder="https://stream.example.com/radio"
                value={settings.stream_url}
                onChange={(e) => setSettings({ ...settings, stream_url: e.target.value })}
              />
              <p className="text-xs text-neutral-600">
                The main audio stream URL for your radio station
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Playlist Integration</CardTitle>
            <CardDescription>Spotify and YouTube playlist IDs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Spotify Playlist IDs
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPlaylistField}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Playlist
                </Button>
              </div>

              <div className="space-y-3">
                {spotifyPlaylists.map((playlistId, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="37i9dQZF1DXcBWIGoYBM5M"
                      value={playlistId}
                      onChange={(e) => updatePlaylistId(index, e.target.value)}
                    />
                    {spotifyPlaylists.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePlaylistField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-neutral-600">
                Found in the Spotify playlist URL after /playlist/. Add multiple playlists to display them in a grid.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="youtube_playlist_id" className="text-sm font-medium">
                YouTube Playlist ID
              </label>
              <Input
                id="youtube_playlist_id"
                placeholder="PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
                value={settings.youtube_playlist_id}
                onChange={(e) => setSettings({ ...settings, youtube_playlist_id: e.target.value })}
              />
              <p className="text-xs text-neutral-600">
                Found in the YouTube playlist URL after list=
              </p>
            </div>
          </CardContent>
        </Card>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.startsWith('Error')
                ? 'bg-red-50 text-red-800'
                : 'bg-green-50 text-green-800'
            }`}
          >
            {message}
          </div>
        )}

        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  )
}
