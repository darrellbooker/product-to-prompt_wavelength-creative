import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, MagnifyingGlass, UserCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { StaffMember } from '@/types/staff'
import { StaffMemberCard } from '@/components/StaffMemberCard'
import { StaffMemberFormDialog } from '@/components/StaffMemberFormDialog'

export function StaffCultureManager() {
  const [staffMembers, setStaffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<StaffMember | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSaveMember = (memberData: Omit<StaffMember, 'id' | 'createdAt'>) => {
    if (editingMember) {
      setStaffMembers((currentMembers) =>
        (currentMembers || []).map((m) =>
          m.id === editingMember.id
            ? { 
                ...memberData, 
                id: editingMember.id, 
                createdAt: editingMember.createdAt 
              }
            : m
        )
      )
      toast.success('Team member updated successfully')
      setEditingMember(undefined)
    } else {
      const newMember: StaffMember = {
        ...memberData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      setStaffMembers((currentMembers) => [...(currentMembers || []), newMember])
      toast.success('Team member added successfully')
    }
    setIsFormOpen(false)
  }

  const handleEditMember = (member: StaffMember) => {
    setEditingMember(member)
    setIsFormOpen(true)
  }

  const handleDeleteMember = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      setStaffMembers((currentMembers) => (currentMembers || []).filter((m) => m.id !== deleteId))
      toast.success('Team member removed')
      setDeleteId(null)
    }
  }

  const handleNewMember = () => {
    setEditingMember(undefined)
    setIsFormOpen(true)
  }

  const filteredMembers = useMemo(() => {
    const currentMembers = staffMembers || []
    if (!searchQuery.trim()) {
      return currentMembers.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    const query = searchQuery.toLowerCase()
    return currentMembers
      .filter((m) => 
        m.name.toLowerCase().includes(query) || 
        m.role.toLowerCase().includes(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [staffMembers, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Culture Builder</h2>
          <p className="text-sm text-muted-foreground">
            Build stronger team connections with personal profiles
          </p>
        </div>
        <Button 
          onClick={handleNewMember}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus size={20} weight="bold" className="mr-2" />
          Add Team Member
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Team Members
          </div>
          <div className="text-3xl font-bold text-primary">
            {staffMembers?.length || 0}
          </div>
        </Card>
      </div>

      <div className="relative">
        <MagnifyingGlass 
          size={18} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
        />
        <Input
          placeholder="Search by name or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-20">
          <div className="mb-6 flex justify-center">
            <UserCircle className="w-32 h-32 text-muted-foreground/20" weight="duotone" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            {searchQuery ? 'No team members found' : 'No team members yet'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? 'Try adjusting your search query'
              : 'Start building your team culture by adding team member profiles'
            }
          </p>
          {!searchQuery && (
            <Button onClick={handleNewMember} size="lg">
              <Plus size={20} weight="bold" className="mr-2" />
              Add Your First Team Member
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member) => (
              <StaffMemberCard
                key={member.id}
                member={member}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <StaffMemberFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingMember(undefined)
          }
        }}
        onSave={handleSaveMember}
        editingMember={editingMember}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This team member profile will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
