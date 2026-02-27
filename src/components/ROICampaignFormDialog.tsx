import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROICampaign, ROIPlatform, Client } from '@/types/campaign'
import { format } from 'date-fns'

interface ROICampaignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (campaign: Omit<ROICampaign, 'id' | 'createdAt' | 'createdBy'>) => void
  editingCampaign?: ROICampaign
  clients: Client[]
}

const platforms: ROIPlatform[] = ['Meta', 'Google', 'LinkedIn', 'Email']

export function ROICampaignFormDialog({
  open,
  onOpenChange,
  onSave,
  editingCampaign,
  clients,
}: ROICampaignFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    platform: 'Meta' as ROIPlatform,
    budget: '',
    startDate: '',
    endDate: '',
    revenue: '',
    conversions: '',
    clicks: '',
    impressions: '',
  })

  useEffect(() => {
    if (editingCampaign) {
      setFormData({
        name: editingCampaign.name,
        clientId: editingCampaign.clientId,
        platform: editingCampaign.platform,
        budget: editingCampaign.budget.toString(),
        startDate: format(new Date(editingCampaign.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(editingCampaign.endDate), 'yyyy-MM-dd'),
        revenue: editingCampaign.revenue?.toString() || '',
        conversions: editingCampaign.conversions?.toString() || '',
        clicks: editingCampaign.clicks?.toString() || '',
        impressions: editingCampaign.impressions?.toString() || '',
      })
    } else {
      setFormData({
        name: '',
        clientId: '',
        platform: 'Meta',
        budget: '',
        startDate: '',
        endDate: '',
        revenue: '',
        conversions: '',
        clicks: '',
        impressions: '',
      })
    }
  }, [editingCampaign, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.clientId || !formData.budget || !formData.startDate || !formData.endDate) {
      return
    }

    onSave({
      name: formData.name,
      clientId: formData.clientId,
      platform: formData.platform,
      budget: parseFloat(formData.budget),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
      conversions: formData.conversions ? parseInt(formData.conversions) : undefined,
      clicks: formData.clicks ? parseInt(formData.clicks) : undefined,
      impressions: formData.impressions ? parseInt(formData.impressions) : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
          <DialogDescription>
            Track your campaign performance and ROI metrics
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name *</Label>
              <Input
                id="campaign-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Product Launch"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                required
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value as ROIPlatform })}
                required
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($) *</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="5000.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date *</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Performance Metrics (Optional)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue ($)</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="7500.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversions">Conversions</Label>
                <Input
                  id="conversions"
                  type="number"
                  min="0"
                  value={formData.conversions}
                  onChange={(e) => setFormData({ ...formData, conversions: e.target.value })}
                  placeholder="150"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clicks">Clicks</Label>
                <Input
                  id="clicks"
                  type="number"
                  min="0"
                  value={formData.clicks}
                  onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
                  placeholder="2500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impressions">Impressions</Label>
                <Input
                  id="impressions"
                  type="number"
                  min="0"
                  value={formData.impressions}
                  onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                  placeholder="50000"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
