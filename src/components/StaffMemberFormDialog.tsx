import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StaffMember } from '@/types/staff'

interface StaffMemberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (memberData: Omit<StaffMember, 'id' | 'createdAt'>) => void
  editingMember?: StaffMember
}

const avatarColors = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#ef4444',
  '#84cc16',
]

export function StaffMemberFormDialog({
  open,
  onOpenChange,
  onSave,
  editingMember,
}: StaffMemberFormDialogProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [avatarColor, setAvatarColor] = useState(avatarColors[0])
  const [family, setFamily] = useState('')
  const [hobbies, setHobbies] = useState('')
  const [interests, setInterests] = useState('')

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name)
      setRole(editingMember.role)
      setAvatarColor(editingMember.avatarColor)
      setFamily(editingMember.personalNotes.family || '')
      setHobbies(editingMember.personalNotes.hobbies || '')
      setInterests(editingMember.personalNotes.interests || '')
    } else {
      setName('')
      setRole('')
      setAvatarColor(avatarColors[Math.floor(Math.random() * avatarColors.length)])
      setFamily('')
      setHobbies('')
      setInterests('')
    }
  }, [editingMember, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role.trim()) return

    onSave({
      name: name.trim(),
      role: role.trim(),
      avatarColor,
      personalNotes: {
        family: family.trim() || undefined,
        hobbies: hobbies.trim() || undefined,
        interests: interests.trim() || undefined,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
          </DialogTitle>
          <DialogDescription>
            {editingMember
              ? 'Update team member information and personal notes.'
              : 'Add a new team member with their role and personal details.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Designer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Avatar Color</Label>
              <div className="flex gap-2 flex-wrap">
                {avatarColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    className="w-10 h-10 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    style={{
                      backgroundColor: color,
                      transform: avatarColor === color ? 'scale(1.1)' : 'scale(1)',
                      border: avatarColor === color ? '3px solid white' : '3px solid transparent',
                      boxShadow: avatarColor === color ? '0 0 0 2px currentColor' : 'none',
                    }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Personal Notes</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Add personal details to help build better connections with your team members
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="family">Family</Label>
                  <Textarea
                    id="family"
                    value={family}
                    onChange={(e) => setFamily(e.target.value)}
                    placeholder="e.g., Married with two kids, Emma (7) and Jack (4)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hobbies">Hobbies</Label>
                  <Textarea
                    id="hobbies"
                    value={hobbies}
                    onChange={(e) => setHobbies(e.target.value)}
                    placeholder="e.g., Marathon runner, loves hiking on weekends"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Textarea
                    id="interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g., Photography, craft beer, sci-fi novels"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !role.trim()}>
              {editingMember ? 'Update' : 'Add'} Team Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
