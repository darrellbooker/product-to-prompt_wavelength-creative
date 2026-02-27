import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Pencil, Trash, CalendarBlank, TrendUp, CurrencyDollar, ChartBar } from '@phosphor-icons/react'
import { ROICampaign, Client } from '@/types/campaign'
import { format } from 'date-fns'

interface ROICampaignCardProps {
  campaign: ROICampaign
  client?: Client
  onEdit: (campaign: ROICampaign) => void
  onDelete: (id: string) => void
}

const platformColors: Record<string, string> = {
  Meta: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  Google: 'bg-red-500/10 text-red-700 border-red-500/20',
  LinkedIn: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  Email: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
}

export function ROICampaignCard({ campaign, client, onEdit, onDelete }: ROICampaignCardProps) {
  const roi = campaign.revenue && campaign.budget 
    ? ((campaign.revenue - campaign.budget) / campaign.budget) * 100 
    : 0
  
  const cpc = campaign.totalSpend && campaign.clicks && campaign.clicks > 0
    ? campaign.totalSpend / campaign.clicks
    : null
  
  const conversionRate = campaign.conversions && campaign.clicks && campaign.clicks > 0
    ? (campaign.conversions / campaign.clicks) * 100
    : null
  
  const roas = campaign.revenue && campaign.totalSpend && campaign.totalSpend > 0
    ? campaign.revenue / campaign.totalSpend
    : null
  
  const isActive = new Date(campaign.startDate) <= new Date() && new Date(campaign.endDate) >= new Date()
  const isUpcoming = new Date(campaign.startDate) > new Date()

  const hasMetrics = campaign.totalSpend || campaign.impressions || campaign.clicks || campaign.conversions

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-1 truncate">{campaign.name}</CardTitle>
              <CardDescription className="text-sm truncate">
                {client?.name || 'Unknown Client'}
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={platformColors[campaign.platform] || 'bg-muted'}
            >
              {campaign.platform}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarBlank size={16} className="shrink-0" />
            <span className="truncate">
              {format(new Date(campaign.startDate), 'MMM d')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <CurrencyDollar size={16} className="shrink-0 text-muted-foreground" />
            <span className="font-semibold">
              ${campaign.budget.toLocaleString()}
            </span>
            <span className="text-muted-foreground">budget</span>
          </div>

          {hasMetrics && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <ChartBar size={14} />
                  <span>Results</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {campaign.totalSpend !== undefined && (
                    <div>
                      <div className="text-muted-foreground">Spend</div>
                      <div className="font-semibold">${campaign.totalSpend.toLocaleString()}</div>
                    </div>
                  )}
                  {campaign.impressions !== undefined && (
                    <div>
                      <div className="text-muted-foreground">Impressions</div>
                      <div className="font-semibold">{campaign.impressions.toLocaleString()}</div>
                    </div>
                  )}
                  {campaign.clicks !== undefined && (
                    <div>
                      <div className="text-muted-foreground">Clicks</div>
                      <div className="font-semibold">{campaign.clicks.toLocaleString()}</div>
                    </div>
                  )}
                  {campaign.conversions !== undefined && (
                    <div>
                      <div className="text-muted-foreground">Conversions</div>
                      <div className="font-semibold">{campaign.conversions.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {(cpc !== null || conversionRate !== null || roas !== null) && (
            <>
              <Separator />
              <div className="space-y-2 bg-muted/30 rounded-md p-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Calculated Metrics
                </div>
                <div className="space-y-1 text-xs">
                  {cpc !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">CPC</span>
                      <span className="font-semibold">${cpc.toFixed(2)}</span>
                    </div>
                  )}
                  {conversionRate !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Conv. Rate</span>
                      <span className="font-semibold">{conversionRate.toFixed(2)}%</span>
                    </div>
                  )}
                  {roas !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ROAS</span>
                      <span className="font-semibold">{roas.toFixed(2)}x</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {campaign.revenue !== undefined && campaign.revenue > 0 && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-semibold">${campaign.revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <TrendUp size={16} className={roi >= 0 ? 'text-green-600' : 'text-red-600'} />
                  <span className="text-sm font-medium">ROI</span>
                </div>
                <span className={`text-lg font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {(isActive || isUpcoming) && (
            <div className="pt-2">
              <Badge variant={isActive ? 'default' : 'secondary'} className="w-full justify-center">
                {isActive ? 'Active' : 'Upcoming'}
              </Badge>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(campaign)}
              className="flex-1"
            >
              <Pencil size={16} className="mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(campaign.id)}
              className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
