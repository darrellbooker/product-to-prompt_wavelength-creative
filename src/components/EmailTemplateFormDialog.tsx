import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { EmailTemplate } from '@/types/campaign'

interface EmailTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void
  editingTemplate?: EmailTemplate
}

export function EmailTemplateFormDialog({
  open,
  onOpenChange,
  onSave,
  editingTemplate,
}: EmailTemplateFormDialogProps) {
  const [name, setName] = useState('')
  const [subjectLine, setSubjectLine] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [emailBody, setEmailBody] = useState('')

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name)
      setSubjectLine(editingTemplate.subjectLine)
      setPreviewText(editingTemplate.previewText)
      setEmailBody(editingTemplate.emailBody)
    } else {
      setName('')
      setSubjectLine('')
      setPreviewText('')
      setEmailBody('')
    }
  }, [editingTemplate, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !subjectLine.trim() || !emailBody.trim()) return

    onSave({
      name: name.trim(),
      subjectLine: subjectLine.trim(),
      previewText: previewText.trim(),
      emailBody: emailBody.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTemplate ? 'Edit Template' : 'Create Email Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Newsletter"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-line">Subject Line *</Label>
            <Input
              id="subject-line"
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              placeholder="Enter email subject line"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preview-text">Preview Text</Label>
            <Input
              id="preview-text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Optional preview text that appears in inbox"
            />
            <p className="text-xs text-muted-foreground">
              This text appears below the subject line in most email clients
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-body">Email Body *</Label>
            <Textarea
              id="email-body"
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
