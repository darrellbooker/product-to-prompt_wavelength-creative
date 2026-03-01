import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { EmailCampaign, Client, EmailStatus, SavedRecipientList, RecipientListItem } from '@/types/campaign'
import { CalendarBlank, UploadSimple, Users, FloppyDisk, Trash, X, Clock, PaperPlaneTilt } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { RichTextEditor } from '@/components/RichTextEditor'
import { toast } from 'sonner'

interface EmailCampaignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'createdBy'>) => void
  editingCampaign?: EmailCampaign
  clients: Client[]
  prefillData?: {
    subjectLine: string
    previewText: string
    emailBody: string
  }
}

export function EmailCampaignFormDialog({
  open,
  onOpenChange,
  onSave,
  editingCampaign,
  clients,
  prefillData,
}: EmailCampaignFormDialogProps) {
  const [savedLists, setSavedLists] = useKV<SavedRecipientList[]>('recipient-lists', [])
  const [clientId, setClientId] = useState('')
  const [subjectLine, setSubjectLine] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sendDate, setSendDate] = useState<Date>()
  const [sendTime, setSendTime] = useState('09:00')
  const [status, setStatus] = useState<EmailStatus>('draft')
  const [recipients, setRecipients] = useState<RecipientListItem[]>([])
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [newListName, setNewListName] = useState('')
  const [showSaveListDialog, setShowSaveListDialog] = useState(false)
  const [scheduleMode, setScheduleMode] = useState(false)

  useEffect(() => {
    if (editingCampaign) {
      setClientId(editingCampaign.clientId)
      setSubjectLine(editingCampaign.subjectLine)
      setPreviewText(editingCampaign.previewText)
      setEmailBody(editingCampaign.emailBody)
      const date = new Date(editingCampaign.sendDate)
      setSendDate(date)
      setSendTime(format(date, 'HH:mm'))
      setStatus(editingCampaign.status)
      setRecipients(editingCampaign.recipients || [])
      setSelectedListId(editingCampaign.recipientListId || '')
      setScheduleMode(editingCampaign.status === 'scheduled')
    } else if (prefillData) {
      setClientId('')
      setSubjectLine(prefillData.subjectLine)
      setPreviewText(prefillData.previewText)
      setEmailBody(prefillData.emailBody)
      setSendDate(undefined)
      setSendTime('09:00')
      setStatus('draft')
      setRecipients([])
      setSelectedListId('')
      setScheduleMode(false)
    } else {
      setClientId('')
      setSubjectLine('')
      setPreviewText('')
      setEmailBody('')
      setSendDate(undefined)
      setSendTime('09:00')
      setStatus('draft')
      setRecipients([])
      setSelectedListId('')
      setScheduleMode(false)
    }
  }, [editingCampaign, prefillData, open])

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      const newRecipients: RecipientListItem[] = []
      
      lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes('email') || line.toLowerCase().includes('name'))) {
          return
        }
        
        const parts = line.split(',').map(p => p.trim().replace(/['"]/g, ''))
        if (parts[0] && parts[0].includes('@')) {
          newRecipients.push({
            email: parts[0],
            name: parts[1] || undefined,
          })
        }
      })

      if (newRecipients.length > 0) {
        setRecipients((current) => [...current, ...newRecipients])
        toast.success(`Added ${newRecipients.length} recipients from CSV`)
      } else {
        toast.error('No valid email addresses found in CSV')
      }
    }
    
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleSelectList = (listId: string) => {
    setSelectedListId(listId)
    if (listId === 'none') {
      return
    }
    const list = (savedLists || []).find(l => l.id === listId)
    if (list) {
      setRecipients(list.recipients)
      toast.success(`Loaded ${list.recipients.length} recipients from ${list.name}`)
    }
  }

  const handleSaveAsList = () => {
    if (!newListName.trim() || recipients.length === 0) {
      toast.error('Please enter a list name and add recipients')
      return
    }

    const newList: SavedRecipientList = {
      id: crypto.randomUUID(),
      name: newListName.trim(),
      recipients: recipients,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setSavedLists((current) => [...(current || []), newList])
    toast.success(`Saved list "${newListName}"`)
    setNewListName('')
    setShowSaveListDialog(false)
    setSelectedListId(newList.id)
  }

  const handleRemoveRecipient = (email: string) => {
    setRecipients((current) => current.filter(r => r.email !== email))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !subjectLine.trim() || !emailBody.trim() || !sendDate) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient')
      return
    }

    const [hours, minutes] = sendTime.split(':')
    const dateTime = new Date(sendDate)
    dateTime.setHours(parseInt(hours), parseInt(minutes))

    onSave({
      clientId,
      subjectLine: subjectLine.trim(),
      previewText: previewText.trim(),
      emailBody: emailBody.trim(),
      sendDate: dateTime.toISOString(),
      status,
      templateId: undefined,
      recipients: recipients,
      recipientListId: selectedListId !== 'none' ? selectedListId : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingCampaign ? 'Edit Email Campaign' : 'Create Email Campaign'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select client" />
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

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as EmailStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-accent" weight="duotone" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Recipients</h3>
                  <Badge variant="secondary" className="ml-2">
                    {recipients.length} selected
                  </Badge>
                </div>
                {recipients.length > 0 && !showSaveListDialog && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveListDialog(true)}
                  >
                    <FloppyDisk size={16} className="mr-2" />
                    Save as List
                  </Button>
                )}
              </div>

              {showSaveListDialog && (
                <Card className="p-3 bg-background/50 border-accent/30">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter list name..."
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" size="sm" onClick={handleSaveAsList}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowSaveListDialog(false)
                        setNewListName('')
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </Card>
              )}

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <UploadSimple size={16} className="mr-2" />
                    Upload CSV
                  </TabsTrigger>
                  <TabsTrigger value="saved">
                    <Users size={16} className="mr-2" />
                    Saved Lists
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-3 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-accent/50 hover:bg-accent/5 transition-colors text-center">
                        <UploadSimple size={32} className="mx-auto mb-2 text-muted-foreground" weight="duotone" />
                        <p className="text-sm font-medium mb-1">Upload CSV File</p>
                        <p className="text-xs text-muted-foreground">
                          CSV should have columns: email, name (optional)
                        </p>
                      </div>
                    </Label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="saved" className="space-y-3 mt-3">
                  {(savedLists || []).length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      <Users size={40} className="mx-auto mb-2 opacity-20" weight="duotone" />
                      <p>No saved lists yet</p>
                      <p className="text-xs mt-1">Upload recipients and save them as a list for reuse</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="saved-list">Select a saved list</Label>
                      <Select value={selectedListId} onValueChange={handleSelectList}>
                        <SelectTrigger id="saved-list">
                          <SelectValue placeholder="Choose a list..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {(savedLists || []).map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              {list.name} ({list.recipients.length} recipients)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {recipients.length > 0 && (
                <div className="space-y-2">
                  <Label>Recipient List</Label>
                  <ScrollArea className="h-32 rounded-md border bg-background/50">
                    <div className="p-2 space-y-1">
                      {recipients.map((recipient) => (
                        <div
                          key={recipient.email}
                          className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent/10 group"
                        >
                          <div className="text-sm">
                            <span className="font-medium">{recipient.email}</span>
                            {recipient.name && (
                              <span className="text-muted-foreground ml-2">({recipient.name})</span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => handleRemoveRecipient(recipient.email)}
                          >
                            <Trash size={14} className="text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line *</Label>
            <Input
              id="subject"
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              placeholder="Enter email subject line"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preview">Preview Text</Label>
            <Input
              id="preview"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Optional preview text that appears in inbox"
            />
            <p className="text-xs text-muted-foreground">
              This text appears below the subject line in most email clients
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body *</Label>
            <RichTextEditor
              value={emailBody}
              onChange={setEmailBody}
              placeholder="Start composing your email with rich formatting..."
              minHeight="450px"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use the toolbar above to format your email with headings, lists, colors, images, and links
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Send Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !sendDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarBlank className="mr-2" size={16} />
                    {sendDate ? format(sendDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sendDate}
                    onSelect={setSendDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Send Time *</Label>
              <Input
                id="time"
                type="time"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                required
              />
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
