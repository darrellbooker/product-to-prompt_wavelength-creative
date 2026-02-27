import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { EmailCampaign, Client, EmailStatus } from '@/types/campaign'
import { CalendarBlank } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

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
  const [clientId, setClientId] = useState('')
  const [subjectLine, setSubjectLine] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sendDate, setSendDate] = useState<Date>()
  const [sendTime, setSendTime] = useState('09:00')
  const [status, setStatus] = useState<EmailStatus>('draft')

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
    } else if (prefillData) {
      setClientId('')
      setSubjectLine(prefillData.subjectLine)
      setPreviewText(prefillData.previewText)
      setEmailBody(prefillData.emailBody)
      setSendDate(undefined)
      setSendTime('09:00')
      setStatus('draft')
    } else {
      setClientId('')
      setSubjectLine('')
      setPreviewText('')
      setEmailBody('')
      setSendDate(undefined)
      setSendTime('09:00')
      setStatus('draft')
    }
  }, [editingCampaign, prefillData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !subjectLine.trim() || !emailBody.trim() || !sendDate) return

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
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
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
            <Textarea
              id="body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Enter your email content here..."
              rows={12}
              className="resize-none font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              {emailBody.length} characters
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

          <DialogFooter>
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
