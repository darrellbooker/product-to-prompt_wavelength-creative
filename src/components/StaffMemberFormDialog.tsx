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
import { Plus, X } from '@phosphor-icons/react'
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
  const [lastOneOnOneDate, setLastOneOnOneDate] = useState('')
  const [askAboutNextTime, setAskAboutNextTime] = useState('')
  const [family, setFamily] = useState('')
  const [hobbies, setHobbies] = useState('')
  const [interests, setInterests] = useState('')
  const [developmentGoals, setDevelopmentGoals] = useState<string[]>([])
  const [recentWins, setRecentWins] = useState<string[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [newWin, setNewWin] = useState('')

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name)
      setRole(editingMember.role)
      setAvatarColor(editingMember.avatarColor)
      setLastOneOnOneDate(editingMember.lastOneOnOneDate || '')
      setAskAboutNextTime(editingMember.askAboutNextTime || '')
      setFamily(editingMember.personalNotes.family || '')
      setHobbies(editingMember.personalNotes.hobbies || '')
      setInterests(editingMember.personalNotes.interests || '')
      setDevelopmentGoals(editingMember.developmentGoals || [])
      setRecentWins(editingMember.recentWins || [])
    } else {
      setName('')
      setRole('')
      setAvatarColor(avatarColors[Math.floor(Math.random() * avatarColors.length)])
      setLastOneOnOneDate('')
      setAskAboutNextTime('')
      setFamily('')
      setHobbies('')
      setInterests('')
      setDevelopmentGoals([])
      setRecentWins([])
    }
    setNewGoal('')
    setNewWin('')
  }, [editingMember, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role.trim()) return

    onSave({
      name: name.trim(),
      role: role.trim(),
      avatarColor,
      lastOneOnOneDate: lastOneOnOneDate || undefined,
      askAboutNextTime: askAboutNextTime.trim() || undefined,
      developmentGoals: developmentGoals.length > 0 ? developmentGoals : undefined,
      recentWins: recentWins.length > 0 ? recentWins : undefined,
      personalNotes: {
        family: family.trim() || undefined,
        hobbies: hobbies.trim() || undefined,
        interests: interests.trim() || undefined,
      },
    })
  }

  const addGoal = () => {
    if (newGoal.trim()) {
      setDevelopmentGoals((prev) => [...prev, newGoal.trim()])
      setNewGoal('')
    }
  }

  const removeGoal = (index: number) => {
    setDevelopmentGoals((prev) => prev.filter((_, i) => i !== index))
  }

  const addWin = () => {
    if (newWin.trim()) {
      setRecentWins((prev) => [...prev, newWin.trim()])
      setNewWin('')
    }
  }

  const removeWin = (index: number) => {
    setRecentWins((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
          </DialogTitle>
          <DialogDescription>
            {editingMember
              ? 'Update team member information and 1-on-1 notes.'
              : 'Add a new team member with their role and 1-on-1 details.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
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
              <h4 className="font-medium mb-3">1-on-1 Tracking</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="last-one-on-one">Last 1-on-1 Date</Label>
                  <Input
                    id="last-one-on-one"
                    type="date"
                    value={lastOneOnOneDate}
                    onChange={(e) => setLastOneOnOneDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ask-about">Ask About Next Time</Label>
                  <Textarea
                    id="ask-about"
                    value={askAboutNextTime}
                    onChange={(e) => setAskAboutNextTime(e.target.value)}
                    placeholder="e.g., How is the new project going? Any blockers with the design system?"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Important topics or questions to discuss in your next 1-on-1
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Development Goals</Label>
                  <div className="space-y-2">
                    {developmentGoals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                        <span className="flex-1 text-sm">{goal}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => removeGoal(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Add a development goal..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addGoal()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={addGoal}
                        disabled={!newGoal.trim()}
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recent Wins</Label>
                  <div className="space-y-2">
                    {recentWins.map((win, index) => (
                      <div key={index} className="flex items-center gap-2 bg-primary/5 p-2 rounded-md border border-primary/10">
                        <span className="flex-1 text-sm">{win}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => removeWin(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newWin}
                        onChange={(e) => setNewWin(e.target.value)}
                        placeholder="Add a recent win..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addWin()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={addWin}
                        disabled={!newWin.trim()}
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Personal Notes</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Add personal details to help build better connections
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
