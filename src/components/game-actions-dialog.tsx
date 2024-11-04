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
import { Input } from "@/components/ui/input"
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

interface GameActionsDialogProps {
  game: { id: number; name: string }
  onEdit: (id: number, newName: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function GameActionsDialog({ game, onEdit, onDelete }: GameActionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [newName, setNewName] = useState(game.name)

  const handleEdit = async () => {
    await onEdit(game.id, newName)
    setOpen(false)
    setEditMode(false)
  }

  const handleDelete = async () => {
    await onDelete(game.id)
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
          <DialogTitle>{editMode ? 'Edit Game' : 'Game Actions'}</DialogTitle>
          <DialogDescription>
            {editMode ? 'Edit the game name below.' : 'What would you like to do with this game?'}
          </DialogDescription>
        </DialogHeader>

        {editMode ? (
          <>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Game name"
              className="mt-4"
            />
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
              Edit Game Name
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="justify-start"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Game
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 