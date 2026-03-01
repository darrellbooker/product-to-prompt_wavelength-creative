import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, MagnifyingGlass, UserCircle, SquaresFour, List, Clock, X, Export } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/csv-export'
import { StaffMember } from '@/types/staff'
import { StaffMemberCard } from '@/components/StaffMemberCard'
import { StaffDashboardCard } from '@/components/StaffDashboardCard'
import { StaffMemberFormDialog } from '@/components/StaffMemberFormDialog'

export function StaffCultureManager() {
  const [staffMembers, setStaffMembers] = useKV<StaffMember[]>('staff-members', [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<StaffMember | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'dashboard' | 'detailed'>('dashboard')

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

  const handleScheduleNext = (memberId: string, nextDate: string) => {
    setStaffMembers((currentMembers) =>
      (currentMembers || []).map((m) =>
        m.id === memberId
          ? { ...m, nextOneOnOneDate: nextDate || undefined }
          : m
      )
    )
  }

  const handleExportStaffCSV = () => {
    if (!filteredMembers.length) {
      toast.error('No data to export')
      return
    }

    const headers = [
      'Name',
      'Role',
      'Last 1-on-1 Date',
      'Next 1-on-1 Date',
      'Ask About Next Time',
      'Development Goals',
      'Recent Wins',
      'Family',
      'Hobbies',
      'Interests',
      'Created At'
    ]

    const rows = filteredMembers.map(member => [
      member.name,
      member.role,
      member.lastOneOnOneDate ? new Date(member.lastOneOnOneDate).toLocaleDateString() : 'Not set',
      member.nextOneOnOneDate ? new Date(member.nextOneOnOneDate).toLocaleDateString() : 'Not scheduled',
      member.askAboutNextTime || '',
      member.developmentGoals?.join('; ') || '',
      member.recentWins?.join('; ') || '',
      member.personalNotes.family || '',
      member.personalNotes.hobbies || '',
      member.personalNotes.interests || '',
      new Date(member.createdAt).toLocaleDateString()
    ])

    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(`staff-members-${timestamp}.csv`, headers, rows)
    toast.success('CSV exported successfully')
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

  const oneOnOneStats = useMemo(() => {
    const currentMembers = staffMembers || []
    const now = new Date()
    let recent = 0
    let upcoming = 0
    let overdue = 0
    let noMeeting = 0

    currentMembers.forEach((member) => {
      if (!member.lastOneOnOneDate) {
        noMeeting++
        return
      }

      const lastMeeting = new Date(member.lastOneOnOneDate)
      const diffTime = now.getTime() - lastMeeting.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 14) {
        recent++
      } else if (diffDays <= 28) {
        upcoming++
      } else {
        overdue++
      }
    })

    return { recent, upcoming, overdue, noMeeting }
  }, [staffMembers])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Culture Builder</h2>
          <p className="text-sm text-muted-foreground">
            Build stronger team connections with personal profiles
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportStaffCSV}
            size="lg"
            variant="outline"
            disabled={!filteredMembers.length}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Export size={20} weight="bold" className="mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={handleNewMember}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus size={20} weight="bold" className="mr-2" />
            Add Team Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Team Members
          </div>
          <div className="text-3xl font-bold text-primary">
            {staffMembers?.length || 0}
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} weight="duotone" className="text-emerald-600" />
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Recent
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            {oneOnOneStats.recent}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} weight="duotone" className="text-amber-600" />
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Due Soon
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600">
            {oneOnOneStats.upcoming}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} weight="duotone" className="text-red-600" />
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Overdue
            </div>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {oneOnOneStats.overdue}
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            id="search-staff"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setViewMode('dashboard')}
            className="gap-2"
          >
            <SquaresFour size={18} weight={viewMode === 'dashboard' ? 'fill' : 'regular'} />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            onClick={() => setViewMode('detailed')}
            className="gap-2"
          >
            <List size={18} weight={viewMode === 'detailed' ? 'fill' : 'regular'} />
            <span className="hidden sm:inline">Detailed</span>
          </Button>
        </div>
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
              viewMode === 'dashboard' ? (
                <StaffDashboardCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                  onScheduleNext={handleScheduleNext}
                />
              ) : (
                <StaffMemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                  onDelete={handleDeleteMember}
                />
              )
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
