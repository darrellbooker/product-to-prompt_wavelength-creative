import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PencilSimple, Trash, Envelope, Clock, CheckCircle, CircleDashed } from '@phosphor-icons/react'
import { EmailCampaign, Client } from '@/types/campaign'
import { format } from 'date-fns'

interface EmailCampaignCardProps {
  campaign: EmailCampaign
  onEdit: (campaign: EmailCampaign) => void
  onDelete: (id: string) => void
  client?: Client
}

const statusConfig = {
  draft: {
    icon: CircleDashed,
    label: 'Draft',
    variant: 'secondary' as const,
  },
  scheduled: {
    icon: Clock,
    label: 'Scheduled',
    variant: 'default' as const,
  },
  sent: {
    icon: CheckCircle,
    label: 'Sent',
    variant: 'default' as const,
  },
}

export function EmailCampaignCard({ campaign, onEdit, onDelete, client }: EmailCampaignCardProps) {
  const status = statusConfig[campaign.status]
  const StatusIcon = status.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="p-5 h-full flex flex-col hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Envelope size={20} weight="duotone" className="text-primary flex-shrink-0" />
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon size={14} weight="bold" />
              {status.label}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(campaign)}
              className="h-8 w-8 p-0"
            >
              <PencilSimple size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(campaign.id)}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {client && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Client
              </p>
              <p className="text-sm font-semibold">
                {client.name}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Subject Line
            </p>
            <p className="text-sm font-semibold line-clamp-2">
              {campaign.subjectLine}
            </p>
          </div>

          {campaign.previewText && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Preview Text
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {campaign.previewText}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Email Body
            </p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {campaign.emailBody}
            </p>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {campaign.status === 'sent' ? 'Sent on' : 'Send on'}
              </span>
              <span className="font-medium">
                {format(new Date(campaign.sendDate), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
        </div>

        {campaign.createdBy && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            <Avatar className="h-6 w-6">
              {campaign.createdBy.avatarUrl && (
                <AvatarImage src={campaign.createdBy.avatarUrl} alt={campaign.createdBy.login} />
              )}
              <AvatarFallback className="text-xs">
                {campaign.createdBy.login.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              by {campaign.createdBy.login}
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
