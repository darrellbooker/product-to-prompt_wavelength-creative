import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PencilSimple, Trash, UserCircle, Heart, Star, Users as UsersIcon, Calendar, ChartLineUp, Lightbulb, Trophy } from '@phosphor-icons/react'
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

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

        {member.askAboutNextTime && (
          <div className="px-6 pb-3">
            <div className="bg-accent/20 border-l-4 border-accent rounded-md p-3">
              <div className="flex items-start gap-2">
                <Lightbulb size={20} weight="duotone" className="text-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                    Ask About Next Time
                  </div>
                  <p className="text-sm leading-relaxed break-words text-foreground">
                    {member.askAboutNextTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <CardContent className="space-y-3 pt-3 border-t">
          {member.lastOneOnOneDate && (
            <div className="flex gap-2">
              <Calendar size={18} weight="duotone" className="text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Last 1-on-1
                </div>
                <p className="text-sm font-medium">
                  {formatDate(member.lastOneOnOneDate)}
                </p>
              </div>
            </div>
          )}

          {member.developmentGoals && member.developmentGoals.length > 0 && (
            <>
              {member.lastOneOnOneDate && <Separator className="my-3" />}
              <div className="flex gap-2">
                <ChartLineUp size={18} weight="duotone" className="text-chart-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Development Goals
                  </div>
                  <ul className="space-y-1.5">
                    {member.developmentGoals.map((goal, index) => (
                      <li key={index} className="text-sm leading-relaxed break-words flex items-start gap-2">
                        <span className="text-chart-2 mt-1 flex-shrink-0">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {member.recentWins && member.recentWins.length > 0 && (
            <>
              {(member.lastOneOnOneDate || (member.developmentGoals && member.developmentGoals.length > 0)) && (
                <Separator className="my-3" />
              )}
              <div className="flex gap-2">
                <Trophy size={18} weight="duotone" className="text-chart-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Recent Wins
                  </div>
                  <ul className="space-y-1.5">
                    {member.recentWins.map((win, index) => (
                      <li key={index} className="text-sm leading-relaxed break-words flex items-start gap-2">
                        <span className="text-chart-4 mt-1 flex-shrink-0">•</span>
                        <span>{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {(member.personalNotes.family || member.personalNotes.hobbies || member.personalNotes.interests) && (
            <>
              {(member.lastOneOnOneDate || 
                (member.developmentGoals && member.developmentGoals.length > 0) || 
                (member.recentWins && member.recentWins.length > 0)) && (
                <Separator className="my-3" />
              )}
              
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
            </>
          )}

          {!member.lastOneOnOneDate && 
           !member.askAboutNextTime &&
           (!member.developmentGoals || member.developmentGoals.length === 0) && 
           (!member.recentWins || member.recentWins.length === 0) &&
           !member.personalNotes.family && 
           !member.personalNotes.hobbies && 
           !member.personalNotes.interests && (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <UserCircle size={32} weight="duotone" className="mr-2" />
              <span className="text-sm">No information yet</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
