import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PencilSimple, Calendar, Clock, CalendarPlus, Check, X } from '@phosphor-icons/react'
import { StaffMember } from '@/types/staff'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface StaffDashboardCardProps {
  member: StaffMember
  onEdit: (member: StaffMember) => void
  onScheduleNext: (memberId: string, nextDate: string) => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getDaysSinceLastMeeting(dateString?: string): number | null {
  if (!dateString) return null
  const lastMeeting = new Date(dateString)
  const today = new Date()
  const diffTime = today.getTime() - lastMeeting.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function getStatusInfo(days: number | null): {
  color: string
  bgColor: string
  borderColor: string
  label: string
  message: string
} {
  if (days === null) {
    return {
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-muted',
      label: 'No 1-on-1 scheduled',
      message: 'Schedule a 1-on-1'
    }
  }

  if (days <= 14) {
    return {
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-300',
      label: 'Recent',
      message: `${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  if (days <= 28) {
    return {
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-300',
      label: 'Follow up soon',
      message: `${days} days ago`
    }
  }

  return {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    label: 'Overdue',
    message: `${days} days ago`
  }
}

export function StaffDashboardCard({ member, onEdit, onScheduleNext }: StaffDashboardCardProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [nextDate, setNextDate] = useState('')
  const daysSince = getDaysSinceLastMeeting(member.lastOneOnOneDate)
  const status = getStatusInfo(daysSince)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleSchedule = () => {
    if (nextDate) {
      onScheduleNext(member.id, nextDate)
      setNextDate('')
      setIsScheduleOpen(false)
      toast.success(`Next 1-on-1 scheduled for ${formatDate(nextDate)}`)
    }
  }

  const handleClearSchedule = () => {
    onScheduleNext(member.id, '')
    toast.success('Scheduled 1-on-1 cleared')
  }

  const isNextDateUpcoming = member.nextOneOnOneDate && new Date(member.nextOneOnOneDate) > new Date()
  const isNextDatePast = member.nextOneOnOneDate && new Date(member.nextOneOnOneDate) <= new Date()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "overflow-hidden hover:shadow-lg transition-all border-l-4",
        status.borderColor
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md"
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => onEdit(member)}
            >
              <PencilSimple size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className={cn(
            "rounded-lg p-4 border-2",
            status.bgColor,
            status.borderColor
          )}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {daysSince === null ? (
                  <Calendar size={24} weight="duotone" className={status.color} />
                ) : (
                  <Clock size={24} weight="duotone" className={status.color} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-xs font-bold uppercase tracking-wider mb-1", status.color)}>
                  {status.label}
                </div>
                <div className={cn("text-sm font-semibold mb-0.5", status.color)}>
                  {status.message}
                </div>
                {member.lastOneOnOneDate && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Last meeting: {formatDate(member.lastOneOnOneDate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {member.nextOneOnOneDate && (
            <div className={cn(
              "rounded-lg p-3 border-2 flex items-center justify-between gap-2",
              isNextDateUpcoming
                ? "bg-blue-50 border-blue-300"
                : "bg-muted border-muted-foreground/30"
            )}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CalendarPlus 
                  size={20} 
                  weight="duotone" 
                  className={isNextDateUpcoming ? "text-blue-600" : "text-muted-foreground"}
                />
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isNextDateUpcoming ? "text-blue-700" : "text-muted-foreground"
                  )}>
                    {isNextDatePast ? 'Was Scheduled' : 'Next 1-on-1'}
                  </div>
                  <div className={cn(
                    "text-sm font-semibold",
                    isNextDateUpcoming ? "text-blue-700" : "text-muted-foreground"
                  )}>
                    {formatDate(member.nextOneOnOneDate)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSchedule}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <X size={14} />
              </Button>
            </div>
          )}

          <Popover open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full gap-2 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
              >
                <CalendarPlus size={18} weight="duotone" />
                {member.nextOneOnOneDate ? 'Reschedule' : 'Schedule'} Next 1-on-1
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Schedule Next 1-on-1</h4>
                  <p className="text-xs text-muted-foreground">
                    Set the date for your next 1-on-1 with {member.name}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`schedule-${member.id}`} className="text-xs">
                    Meeting Date
                  </Label>
                  <Input
                    id={`schedule-${member.id}`}
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSchedule}
                    disabled={!nextDate}
                    className="flex-1 gap-2"
                  >
                    <Check size={16} weight="bold" />
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNextDate('')
                      setIsScheduleOpen(false)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {member.askAboutNextTime && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
              <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-1.5">
                Ask About Next Time
              </div>
              <p className="text-sm leading-relaxed break-words text-foreground">
                {member.askAboutNextTime}
              </p>
            </div>
          )}

          {member.developmentGoals && member.developmentGoals.length > 0 && (
            <div className="bg-card rounded-lg p-3 border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Active Goals
              </div>
              <div className="flex flex-wrap gap-1.5">
                {member.developmentGoals.slice(0, 3).map((goal, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {goal.length > 30 ? `${goal.substring(0, 30)}...` : goal}
                  </Badge>
                ))}
                {member.developmentGoals.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{member.developmentGoals.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
