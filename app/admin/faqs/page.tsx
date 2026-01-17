// @ts-nocheck
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

type FAQ = Database['public']['Tables']['faqs']['Row']

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadFAQs()
  }, [])

  const loadFAQs = async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true })

    if (!error && data) {
      setFaqs(data)
    }
    setLoading(false)
  }

  const openDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq)
      setFormData({
        question: faq.question,
        answer: faq.answer,
      })
    } else {
      setEditingFAQ(null)
      setFormData({
        question: '',
        answer: '',
      })
    }
    setDialogOpen(true)
  }

  const saveFAQ = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingFAQ) {
        const { data, error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', editingFAQ.id)
          .select()
          .single()

        if (!error && data) {
          setFaqs(faqs.map(f => f.id === data.id ? data : f))
        }
      } else {
        const { data, error } = await supabase
          .from('faqs')
          .insert([{ ...formData, display_order: faqs.length }])
          .select()
          .single()

        if (!error && data) {
          setFaqs([...faqs, data])
        }
      }

      setDialogOpen(false)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id)

    if (!error) {
      setFaqs(faqs.filter(f => f.id !== id))
    }
  }

  const moveFAQ = async (id: string, direction: 'up' | 'down') => {
    const index = faqs.findIndex(f => f.id === id)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === faqs.length - 1)
    ) return

    const newFAQs = [...faqs]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newFAQs[index], newFAQs[targetIndex]] = [newFAQs[targetIndex], newFAQs[index]]

    // Update display_order
    for (let i = 0; i < newFAQs.length; i++) {
      await supabase
        .from('faqs')
        .update({ display_order: i })
        .eq('id', newFAQs[i].id)
      newFAQs[i].display_order = i
    }

    setFaqs(newFAQs)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-600">Loading FAQs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="text-neutral-600">Manage frequently asked questions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
              <DialogDescription>
                Create a new frequently asked question
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={saveFAQ} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="question" className="text-sm font-medium">
                  Question *
                </label>
                <Input
                  id="question"
                  placeholder="How can I listen to the radio?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="answer" className="text-sm font-medium">
                  Answer *
                </label>
                <Textarea
                  id="answer"
                  placeholder="You can listen via..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Saving...' : editingFAQ ? 'Update FAQ' : 'Add FAQ'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQs ({faqs.length})</CardTitle>
          <CardDescription>Reorder, edit, or delete FAQs</CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">No FAQs yet</p>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="flex items-start gap-4 rounded-lg border border-neutral-200 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveFAQ(faq.id, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveFAQ(faq.id, 'down')}
                      disabled={index === faqs.length - 1}
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium">{faq.question}</h3>
                    <p className="text-sm text-neutral-600">{faq.answer}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDialog(faq)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteFAQ(faq.id)}
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
