import { useState, useMemo, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, ChartLineUp, TrendUp, Target, CurrencyDollar, PencilSimple, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ROICampaign, ROIPlatform, Client } from '@/types/campaign'
import { ROICampaignFormDialog } from './ROICampaignFormDialog'
import { cn } from '@/lib/utils'

interface ROIManagerProps {
  clients: Client[]
}

export function ROIManager({ clients }: ROIManagerProps) {
  const [campaigns, setCampaigns] = useKV<ROICampaign[]>('roi-campaigns', [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<ROICampaign | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterClient, setFilterClient] = useState<string>('all')
  const [currentUser, setCurrentUser] = useState<{ login: string; avatarUrl: string }>({ login: 'user', avatarUrl: '' })

  useEffect(() => {
    window.spark.user().then((user) => {
      setCurrentUser({
        login: user?.login || 'user',
        avatarUrl: user?.avatarUrl || '',
      })
    }).catch(() => {
      setCurrentUser({ login: 'user', avatarUrl: '' })
    })
  }, [])

  const handleSaveCampaign = async (campaignData: Omit<ROICampaign, 'id' | 'createdAt' | 'createdBy'>) => {
    let user = currentUser
    if (!user || !user.login) {
      try {
        const userInfo = await window.spark.user()
        user = { login: userInfo?.login || 'user', avatarUrl: userInfo?.avatarUrl || '' }
      } catch {
        user = { login: 'user', avatarUrl: '' }
      }
    }
    
    if (editingCampaign) {
      setCampaigns((currentCampaigns) =>
        (currentCampaigns || []).map((c) =>
          c.id === editingCampaign.id
            ? { 
                ...campaignData, 
                id: editingCampaign.id, 
                createdAt: editingCampaign.createdAt,
                createdBy: editingCampaign.createdBy 
              }
            : c
        )
      )
      toast.success('Campaign updated successfully')
      setEditingCampaign(undefined)
    } else {
      const newCampaign: ROICampaign = {
        ...campaignData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdBy: {
          login: user.login,
          avatarUrl: user.avatarUrl,
        },
      }
      setCampaigns((currentCampaigns) => [...(currentCampaigns || []), newCampaign])
      toast.success('Campaign created successfully')
    }
    setIsFormOpen(false)
  }

  const getClientById = (clientId: string): Client | undefined => {
    return clients?.find((c) => c.id === clientId)
  }

  const handleEditCampaign = (campaign: ROICampaign) => {
    setEditingCampaign(campaign)
    setIsFormOpen(true)
  }

  const handleDeleteCampaign = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      setCampaigns((currentCampaigns) => (currentCampaigns || []).filter((c) => c.id !== deleteId))
      toast.success('Campaign deleted')
      setDeleteId(null)
    }
  }

  const handleNewCampaign = () => {
    setEditingCampaign(undefined)
    setIsFormOpen(true)
  }

  const filteredCampaigns = useMemo(() => {
    const currentCampaigns = campaigns || []
    let filtered = currentCampaigns

    if (filterClient !== 'all') {
      filtered = filtered.filter((c) => c.clientId === filterClient)
    }

    return filtered.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
  }, [campaigns, filterClient])

  const stats = useMemo(() => {
    const currentCampaigns = campaigns || []
    const totalBudget = currentCampaigns.reduce((sum, c) => sum + c.budget, 0)
    const totalRevenue = currentCampaigns.reduce((sum, c) => sum + (c.revenue || 0), 0)
    const totalROI = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0
    const activeCampaigns = currentCampaigns.filter(c => 
      new Date(c.startDate) <= new Date() && new Date(c.endDate) >= new Date()
    ).length

    const platformBreakdown: Record<ROIPlatform, { budget: number; revenue: number; count: number }> = {
      Meta: { budget: 0, revenue: 0, count: 0 },
      Google: { budget: 0, revenue: 0, count: 0 },
      LinkedIn: { budget: 0, revenue: 0, count: 0 },
      Email: { budget: 0, revenue: 0, count: 0 },
    }

    currentCampaigns.forEach(campaign => {
      platformBreakdown[campaign.platform].budget += campaign.budget
      platformBreakdown[campaign.platform].revenue += campaign.revenue || 0
      platformBreakdown[campaign.platform].count += 1
    })

    return {
      totalBudget,
      totalRevenue,
      totalROI,
      activeCampaigns,
      platformBreakdown,
    }
  }, [campaigns])

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Campaign ROI Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Track performance and return on investment for all campaigns
            </p>
          </div>
          <Button 
            onClick={handleNewCampaign}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus size={20} weight="bold" className="mr-2" />
            Add Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Budget
              </div>
              <CurrencyDollar size={20} className="text-primary" weight="duotone" />
            </div>
            <div className="text-3xl font-bold text-primary">
              ${stats.totalBudget.toLocaleString()}
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Revenue
              </div>
              <TrendUp size={20} className="text-green-600" weight="duotone" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-accent/15 to-accent/5 border-accent/30">
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total ROI
              </div>
              <ChartLineUp size={20} className="text-accent-foreground" weight="duotone" />
            </div>
            <div className={`text-3xl font-bold ${stats.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalROI >= 0 ? '+' : ''}{stats.totalROI.toFixed(1)}%
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-secondary/30 to-secondary/10 border-secondary/40">
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Active Campaigns
              </div>
              <Target size={20} className="text-secondary-foreground" weight="duotone" />
            </div>
            <div className="text-3xl font-bold text-secondary-foreground">
              {stats.activeCampaigns}
            </div>
          </Card>
        </div>

        <Separator />

        <div className="mb-4">
          <Label htmlFor="client-filter" className="text-sm font-medium mb-2 block">
            Filter by Client
          </Label>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger id="client-filter" className="w-full sm:w-64">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6 flex justify-center">
              <ChartLineUp size={128} className="text-muted-foreground/20" weight="duotone" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {(campaigns || []).length === 0
                ? 'No campaigns yet'
                : 'No campaigns match your filter'
              }
            </h2>
            <p className="text-muted-foreground mb-6">
              {(campaigns || []).length === 0
                ? 'Start tracking your campaign ROI by creating your first campaign'
                : 'Try selecting a different client or clear the filter'
              }
            </p>
            {(campaigns || []).length === 0 ? (
              <Button onClick={handleNewCampaign} size="lg">
                <Plus size={20} weight="bold" className="mr-2" />
                Create Your First Campaign
              </Button>
            ) : (
              <Button onClick={() => setFilterClient('all')} size="lg" variant="outline">
                Clear Filter
              </Button>
            )}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">CPC</TableHead>
                    <TableHead className="text-right">Conv. Rate</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const client = getClientById(campaign.clientId)
                    const cpc = campaign.clicks && campaign.clicks > 0 && campaign.totalSpend
                      ? campaign.totalSpend / campaign.clicks
                      : 0
                    const conversionRate = campaign.clicks && campaign.clicks > 0 && campaign.conversions
                      ? (campaign.conversions / campaign.clicks) * 100
                      : 0
                    const roas = campaign.totalSpend && campaign.totalSpend > 0 && campaign.revenue
                      ? campaign.revenue / campaign.totalSpend
                      : 0

                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{client?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-sm">
                            {campaign.platform}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${campaign.budget.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ${(campaign.revenue || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${(campaign.totalSpend || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.impressions?.toLocaleString() || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.clicks?.toLocaleString() || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.conversions?.toLocaleString() || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {cpc > 0 ? `$${cpc.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {conversionRate > 0 ? `${conversionRate.toFixed(2)}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {roas > 0 ? (
                            <span className={cn(
                              'font-medium',
                              roas >= 1 ? 'text-green-600' : 'text-red-600'
                            )}>
                              {roas.toFixed(2)}x
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCampaign(campaign)}
                              className="h-8 w-8 p-0"
                            >
                              <PencilSimple size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      <ROICampaignFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingCampaign(undefined)
          }
        }}
        onSave={handleSaveCampaign}
        editingCampaign={editingCampaign}
        clients={clients || []}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This campaign and all its data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
