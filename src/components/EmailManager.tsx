import { useState, useMemo, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Envelope, FileText, Export } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/csv-export'
import { EmailCampaign, EmailTemplate, Client } from '@/types/campaign'
import { EmailCampaignCard } from './EmailCampaignCard'
import { EmailCampaignList } from './EmailCampaignList'
import { EmailTemplateCard } from './EmailTemplateCard'
import { EmailCampaignFormDialog } from './EmailCampaignFormDialog'
import { EmailTemplateFormDialog } from './EmailTemplateFormDialog'

interface EmailManagerProps {
  clients: Client[]
}

export function EmailManager({ clients }: EmailManagerProps) {
  const [campaigns, setCampaigns] = useKV<EmailCampaign[]>('email-campaigns', [])
  const [templates, setTemplates] = useKV<EmailTemplate[]>('email-templates', [])
  const [isCampaignFormOpen, setIsCampaignFormOpen] = useState(false)
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | undefined>()
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>()
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null)
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null)
  const [templatePrefillData, setTemplatePrefillData] = useState<{ subjectLine: string; previewText: string; emailBody: string } | undefined>()
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

  const handleSaveCampaign = async (campaignData: Omit<EmailCampaign, 'id' | 'createdAt' | 'createdBy'>) => {
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
                createdBy: editingCampaign.createdBy,
              }
            : c
        )
      )
      toast.success('Email campaign updated')
      setEditingCampaign(undefined)
    } else {
      const newCampaign: EmailCampaign = {
        ...campaignData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdBy: {
          login: user.login,
          avatarUrl: user.avatarUrl,
        },
      }
      setCampaigns((currentCampaigns) => [...(currentCampaigns || []), newCampaign])
      toast.success('Email campaign created')
    }
    setIsCampaignFormOpen(false)
    setTemplatePrefillData(undefined)
  }

  const handleSaveTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    let user = currentUser
    if (!user || !user.login) {
      try {
        const userInfo = await window.spark.user()
        user = { login: userInfo?.login || 'user', avatarUrl: userInfo?.avatarUrl || '' }
      } catch {
        user = { login: 'user', avatarUrl: '' }
      }
    }

    if (editingTemplate) {
      setTemplates((currentTemplates) =>
        (currentTemplates || []).map((t) =>
          t.id === editingTemplate.id
            ? {
                ...templateData,
                id: editingTemplate.id,
                createdAt: editingTemplate.createdAt,
                updatedAt: new Date().toISOString(),
                createdBy: editingTemplate.createdBy,
              }
            : t
        )
      )
      toast.success('Template updated')
      setEditingTemplate(undefined)
    } else {
      const newTemplate: EmailTemplate = {
        ...templateData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          login: user.login,
          avatarUrl: user.avatarUrl,
        },
      }
      setTemplates((currentTemplates) => [...(currentTemplates || []), newTemplate])
      toast.success('Template saved')
    }
    setIsTemplateFormOpen(false)
  }

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign)
    setTemplatePrefillData(undefined)
    setIsCampaignFormOpen(true)
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setIsTemplateFormOpen(true)
  }

  const handleDeleteCampaign = (id: string) => {
    setDeleteCampaignId(id)
  }

  const handleDeleteTemplate = (id: string) => {
    setDeleteTemplateId(id)
  }

  const confirmDeleteCampaign = () => {
    if (deleteCampaignId) {
      setCampaigns((currentCampaigns) => (currentCampaigns || []).filter((c) => c.id !== deleteCampaignId))
      toast.success('Email campaign deleted')
      setDeleteCampaignId(null)
    }
  }

  const confirmDeleteTemplate = () => {
    if (deleteTemplateId) {
      setTemplates((currentTemplates) => (currentTemplates || []).filter((t) => t.id !== deleteTemplateId))
      toast.success('Template deleted')
      setDeleteTemplateId(null)
    }
  }

  const handleUseTemplate = (template: EmailTemplate) => {
    setTemplatePrefillData({
      subjectLine: template.subjectLine,
      previewText: template.previewText,
      emailBody: template.emailBody,
    })
    setEditingCampaign(undefined)
    setIsCampaignFormOpen(true)
  }

  const handleNewCampaign = () => {
    setEditingCampaign(undefined)
    setTemplatePrefillData(undefined)
    setIsCampaignFormOpen(true)
  }

  const handleNewTemplate = () => {
    setEditingTemplate(undefined)
    setIsTemplateFormOpen(true)
  }

  const handleExportEmailCSV = () => {
    if (!sortedCampaigns.length) {
      toast.error('No data to export')
      return
    }

    const headers = [
      'Client',
      'Subject Line',
      'Preview Text',
      'Send Date',
      'Status',
      'Recipients',
      'Open Rate',
      'Click Rate',
      'Bounce Rate',
      'Unsubscribe Rate',
      'Created By',
      'Created At'
    ]

    const rows = sortedCampaigns.map(campaign => [
      getClientById(campaign.clientId)?.name || 'Unknown',
      campaign.subjectLine,
      campaign.previewText,
      new Date(campaign.sendDate).toLocaleDateString(),
      campaign.status,
      campaign.recipients.length,
      campaign.stats?.openRate ? `${campaign.stats.openRate}%` : 'N/A',
      campaign.stats?.clickRate ? `${campaign.stats.clickRate}%` : 'N/A',
      campaign.stats?.bounceRate ? `${campaign.stats.bounceRate}%` : 'N/A',
      campaign.stats?.unsubscribeRate ? `${campaign.stats.unsubscribeRate}%` : 'N/A',
      campaign.createdBy.login,
      new Date(campaign.createdAt).toLocaleDateString()
    ])

    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(`email-campaigns-${timestamp}.csv`, headers, rows)
    toast.success('CSV exported successfully')
  }

  const getClientById = (clientId: string): Client | undefined => {
    return clients?.find((c) => c.id === clientId)
  }

  const sortedCampaigns = useMemo(() => {
    const currentCampaigns = campaigns || []
    return currentCampaigns.sort((a, b) => 
      new Date(a.sendDate).getTime() - new Date(b.sendDate).getTime()
    )
  }, [campaigns])

  const sortedTemplates = useMemo(() => {
    const currentTemplates = templates || []
    return currentTemplates.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [templates])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="campaigns" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="campaigns" className="flex-1 sm:flex-initial">
              <Envelope size={16} className="mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1 sm:flex-initial">
              <FileText size={16} className="mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button 
              onClick={handleExportEmailCSV} 
              size="lg" 
              variant="outline"
              disabled={!sortedCampaigns.length}
              className="flex-1 sm:flex-initial"
            >
              <Export size={20} weight="bold" className="mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleNewCampaign} size="lg" className="flex-1 sm:flex-initial">
              <Plus size={20} weight="bold" className="mr-2" />
              New Campaign
            </Button>
            <Button onClick={handleNewTemplate} size="lg" variant="outline" className="flex-1 sm:flex-initial">
              <Plus size={20} weight="bold" className="mr-2" />
              New Template
            </Button>
          </div>
        </div>

        <TabsContent value="campaigns" className="mt-0 space-y-6">
          <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Total Campaigns
            </div>
            <div className="text-3xl font-bold text-accent">
              {campaigns?.length || 0}
            </div>
          </Card>

          {sortedCampaigns.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-6 flex justify-center">
                <Envelope size={80} weight="duotone" className="text-muted-foreground/20" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No email campaigns yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first email campaign or use a template to get started
              </p>
              <Button onClick={handleNewCampaign} size="lg">
                <Plus size={20} weight="bold" className="mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <>
              <Separator />
              <EmailCampaignList
                campaigns={sortedCampaigns}
                onEdit={handleEditCampaign}
                onDelete={handleDeleteCampaign}
                getClientById={getClientById}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <Card className="p-4 mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Total Templates
            </div>
            <div className="text-3xl font-bold text-primary">
              {templates?.length || 0}
            </div>
          </Card>

          {sortedTemplates.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-6 flex justify-center">
                <FileText size={80} weight="duotone" className="text-muted-foreground/20" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No templates saved</h2>
              <p className="text-muted-foreground mb-6">
                Save email templates to reuse them across multiple campaigns
              </p>
              <Button onClick={handleNewTemplate} size="lg">
                <Plus size={20} weight="bold" className="mr-2" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {sortedTemplates.map((template) => (
                  <EmailTemplateCard
                    key={template.id}
                    template={template}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                    onUse={handleUseTemplate}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EmailCampaignFormDialog
        open={isCampaignFormOpen}
        onOpenChange={(open) => {
          setIsCampaignFormOpen(open)
          if (!open) {
            setEditingCampaign(undefined)
            setTemplatePrefillData(undefined)
          }
        }}
        onSave={handleSaveCampaign}
        editingCampaign={editingCampaign}
        clients={clients || []}
        prefillData={templatePrefillData}
      />

      <EmailTemplateFormDialog
        open={isTemplateFormOpen}
        onOpenChange={(open) => {
          setIsTemplateFormOpen(open)
          if (!open) {
            setEditingTemplate(undefined)
          }
        }}
        onSave={handleSaveTemplate}
        editingTemplate={editingTemplate}
      />

      <AlertDialog open={!!deleteCampaignId} onOpenChange={(open) => !open && setDeleteCampaignId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This campaign will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCampaign} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This template will be permanently removed from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
