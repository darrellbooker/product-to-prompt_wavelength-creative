import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PencilSimple, Trash, CircleDashed, Clock, CheckCircle, Users, EnvelopeOpen, CursorClick, TrendUp } from '@phosphor-icons/react'
import { EmailCampaign, Client } from '@/types/campaign'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface EmailCampaignListProps {
  campaigns: EmailCampaign[]
  onEdit: (campaign: EmailCampaign) => void
  onDelete: (id: string) => void
  getClientById: (clientId: string) => Client | undefined
}

const statusConfig = {
  draft: {
    icon: CircleDashed,
    label: 'Draft',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  scheduled: {
    icon: Clock,
    label: 'Scheduled',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  sent: {
    icon: CheckCircle,
    label: 'Sent',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
}

export function EmailCampaignList({ campaigns, onEdit, onDelete, getClientById }: EmailCampaignListProps) {
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const dateA = new Date(a.sendDate).getTime()
    const dateB = new Date(b.sendDate).getTime()
    return dateB - dateA
  })

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">All Campaigns</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {campaigns.length} total campaign{campaigns.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span>Draft</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Sent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="min-w-[200px]">Subject Line</TableHead>
              <TableHead className="w-[150px]">Client</TableHead>
              <TableHead className="w-[100px] text-center">Recipients</TableHead>
              <TableHead className="w-[180px]">Send Date</TableHead>
              <TableHead className="w-[100px] text-center">Open Rate</TableHead>
              <TableHead className="w-[100px] text-center">Click Rate</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users size={48} weight="duotone" className="mb-3 opacity-20" />
                    <p className="text-sm">No campaigns yet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedCampaigns.map((campaign, index) => {
                const status = statusConfig[campaign.status]
                const StatusIcon = status.icon
                const client = getClientById(campaign.clientId)

                return (
                  <motion.tr
                    key={campaign.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', status.bgColor)} />
                        <Badge variant="outline" className={cn('gap-1.5 border-0', status.bgColor, status.color)}>
                          <StatusIcon size={12} weight="bold" />
                          {status.label}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium line-clamp-1">{campaign.subjectLine}</p>
                        {campaign.previewText && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {campaign.previewText}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-medium">{client?.name || 'Unknown'}</span>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Users size={14} className="text-muted-foreground" weight="duotone" />
                        <span className="text-sm font-semibold">{campaign.recipients?.length || 0}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                          {format(new Date(campaign.sendDate), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(campaign.sendDate), 'h:mm a')}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {campaign.status === 'sent' ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1">
                            <EnvelopeOpen size={12} className="text-accent" weight="duotone" />
                            <span className="text-sm font-semibold text-accent">
                              {campaign.stats?.openRate !== undefined 
                                ? `${campaign.stats.openRate.toFixed(1)}%` 
                                : '—'}
                            </span>
                          </div>
                          {campaign.stats?.openRate !== undefined && campaign.stats.openRate > 25 && (
                            <TrendUp size={10} className="text-accent" weight="bold" />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {campaign.status === 'sent' ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1">
                            <CursorClick size={12} className="text-primary" weight="duotone" />
                            <span className="text-sm font-semibold text-primary">
                              {campaign.stats?.clickRate !== undefined 
                                ? `${campaign.stats.clickRate.toFixed(1)}%` 
                                : '—'}
                            </span>
                          </div>
                          {campaign.stats?.clickRate !== undefined && campaign.stats.clickRate > 3 && (
                            <TrendUp size={10} className="text-primary" weight="bold" />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(campaign)}
                          className="h-8 w-8 p-0"
                        >
                          <PencilSimple size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(campaign.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
