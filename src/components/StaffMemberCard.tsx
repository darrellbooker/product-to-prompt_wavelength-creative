import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PencilSimple, Trash, UserCircle, Heart, Star, Users as UsersIcon } from '@phosphor-icons/react'
import { StaffMember } from '@/types/staff'

interface StaffMemberCardProps {
  member: StaffMember
  onEdit: (member: StaffMember) => void
  onDelete: (id: string) => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function StaffMemberCard({ member, onEdit, onDelete }: StaffMemberCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                style={{ backgroundColor: member.avatarColor }}
              >
                {getInitials(member.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight truncate">
                  {member.name}
                </h3>
                <Badge variant="secondary" className="mt-1">
                  {member.role}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(member)}
              >
                <PencilSimple size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(member.id)}
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-3 border-t">
          {member.personalNotes.family && (
            <div className="flex gap-2">
              <UsersIcon size={18} weight="duotone" className="text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Family
                </div>
                <p className="text-sm leading-relaxed break-words">
                  {member.personalNotes.family}
                </p>
              </div>
            </div>
          )}
          {member.personalNotes.hobbies && (
            <div className="flex gap-2">
              <Heart size={18} weight="duotone" className="text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Hobbies
                </div>
                <p className="text-sm leading-relaxed break-words">
                  {member.personalNotes.hobbies}
                </p>
              </div>
            </div>
          )}
          {member.personalNotes.interests && (
            <div className="flex gap-2">
              <Star size={18} weight="duotone" className="text-chart-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Interests
                </div>
                <p className="text-sm leading-relaxed break-words">
                  {member.personalNotes.interests}
                </p>
              </div>
            </div>
          )}
          {!member.personalNotes.family && !member.personalNotes.hobbies && !member.personalNotes.interests && (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <UserCircle size={32} weight="duotone" className="mr-2" />
              <span className="text-sm">No personal notes yet</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
