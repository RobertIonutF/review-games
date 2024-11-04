'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

type Mood = 'Happy' | 'Dissatisfied' | 'Neutral'

interface ThoughtActionsDialogProps {
  thought: { id: number; content: string; mood: Mood }
  onEdit: (id: number, content: string, mood: Mood) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function ThoughtActionsDialog({ thought, onEdit, onDelete }: ThoughtActionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [content, setContent] = useState(thought.content)
  const [mood, setMood] = useState<Mood>(thought.mood)

  const handleEdit = async () => {
    await onEdit(thought.id, content, mood)
    setOpen(false)
    setEditMode(false)
  }

  const handleDelete = async () => {
    await onDelete(thought.id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Thought' : 'Thought Actions'}</DialogTitle>
          <DialogDescription>
            {editMode ? 'Edit your thought below.' : 'What would you like to do with this thought?'}
          </DialogDescription>
        </DialogHeader>

        {editMode ? (
          <>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your thought..."
              className="mt-4"
            />
            <Select value={mood} onValueChange={(value: Mood) => setMood(value)}>
              <SelectTrigger className="mt-4">
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Happy">Happy</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Dissatisfied">Dissatisfied</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
              className="justify-start"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Thought
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="justify-start"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Thought
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 