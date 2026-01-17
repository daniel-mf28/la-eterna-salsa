// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Plus, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/database.types'

type AdminEmail = Database['public']['Tables']['admin_emails']['Row']

export default function AdminSettingsPage() {
  const [emails, setEmails] = useState<AdminEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    const { data, error } = await supabase
      .from('admin_emails')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setEmails(data)
    }
    setLoading(false)
  }

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data, error } = await supabase
      .from('admin_emails')
      .insert([{ email: newEmail }])
      .select()
      .single()

    if (!error && data) {
      setEmails([...emails, data])
      setNewEmail('')
      setDialogOpen(false)
    } else {
      alert(error?.message || 'Failed to add email')
    }
    setSubmitting(false)
  }

  const deleteEmail = async (id: string) => {
    if (emails.length === 1) {
      alert('Cannot delete the last admin email')
      return
    }

    if (!confirm('Are you sure you want to remove this admin email?')) return

    const { error } = await supabase
      .from('admin_emails')
      .delete()
      .eq('id', id)

    if (!error) {
      setEmails(emails.filter(e => e.id !== id))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-neutral-600">Manage admin access and account settings</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Admin Emails</CardTitle>
            <CardDescription>Users with these emails can access the admin panel</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Admin Email</DialogTitle>
                <DialogDescription>
                  Grant admin access to a new email address
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={addEmail} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@laeternasalsa.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Admin Email'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">No admin emails configured</p>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 p-4"
                >
                  <div>
                    <p className="font-medium">{email.email}</p>
                    <p className="text-xs text-neutral-500">
                      Added {new Date(email.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteEmail(email.id)}
                    disabled={emails.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your current session details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-neutral-50 p-4">
            <p className="text-sm text-neutral-600">
              You are currently signed in. Use the "Sign Out" button above to log out of the admin panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
