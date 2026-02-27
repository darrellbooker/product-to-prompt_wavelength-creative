import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarBlank } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { CampaignPost, Platform, Client, PostStatus } from '@/types/campaign'
import { getPlatformName, PlatformIcon } from './PlatformIcon'
import { cn } from '@/lib/utils'

interface PostFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (post: Omit<CampaignPost, 'id' | 'createdAt' | 'createdBy'>) => void
  editingPost?: CampaignPost
  clients: Client[]
}

const platforms: Platform[] = ['twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'tiktok']

export function PostFormDialog({ open, onOpenChange, onSave, editingPost, clients }: PostFormDialogProps) {
  const [platform, setPlatform] = useState<Platform>(editingPost?.platform || 'twitter')
  const [content, setContent] = useState(editingPost?.content || '')
  const [postDate, setPostDate] = useState<Date | undefined>(
    editingPost?.postDate ? new Date(editingPost.postDate) : undefined
  )
  const [clientId, setClientId] = useState<string>(editingPost?.clientId || '')
  const [status, setStatus] = useState<PostStatus>(editingPost?.status || 'draft')
  const [errors, setErrors] = useState<{ content?: string; postDate?: string; clientId?: string }>({})

  useEffect(() => {
    if (editingPost) {
      setPlatform(editingPost.platform)
      setContent(editingPost.content)
      setPostDate(new Date(editingPost.postDate))
      setClientId(editingPost.clientId)
      setStatus(editingPost.status)
    }
  }, [editingPost])

  const handleSave = () => {
    const newErrors: { content?: string; postDate?: string; clientId?: string } = {}
    
    if (!content.trim()) {
      newErrors.content = 'Content is required'
    }
    
    if (!postDate) {
      newErrors.postDate = 'Post date is required'
    }

    if (!clientId) {
      newErrors.clientId = 'Client is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onSave({
      platform,
      content: content.trim(),
      postDate: postDate!.toISOString(),
      clientId,
      status,
    })
    
    handleClose()
  }

  const handleClose = () => {
    setPlatform('twitter')
    setContent('')
    setPostDate(undefined)
    setClientId('')
    setStatus('draft')
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </DialogTitle>
          <DialogDescription>
            {editingPost ? 'Update your campaign post details below.' : 'Add a new post to your social media campaign.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-xs uppercase tracking-wide font-medium">
              Client
            </Label>
            <Select 
              value={clientId} 
              onValueChange={(value) => {
                setClientId(value)
                setErrors((prev) => ({ ...prev, clientId: undefined }))
              }}
            >
              <SelectTrigger id="client" className={cn(errors.clientId && 'border-destructive')}>
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
            {errors.clientId && (
              <p className="text-sm text-destructive">{errors.clientId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform" className="text-xs uppercase tracking-wide font-medium">
              Platform
            </Label>
            <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={p} size={20} />
                      <span>{getPlatformName(p)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs uppercase tracking-wide font-medium">
              Status
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value as PostStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-xs uppercase tracking-wide font-medium">
              Content
            </Label>
            <Textarea
              id="content"
              placeholder="What's your message?"
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setErrors((prev) => ({ ...prev, content: undefined }))
              }}
              rows={5}
              className={cn(errors.content && 'border-destructive')}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content}</p>
            )}
            <p className="text-xs text-muted-foreground">{content.length} characters</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide font-medium">
              Post Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !postDate && 'text-muted-foreground',
                    errors.postDate && 'border-destructive'
                  )}
                >
                  <CalendarBlank className="mr-2" size={16} />
                  {postDate ? format(postDate, 'PPP') : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={postDate}
                  onSelect={(date) => {
                    setPostDate(date)
                    setErrors((prev) => ({ ...prev, postDate: undefined }))
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.postDate && (
              <p className="text-sm text-destructive">{errors.postDate}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingPost ? 'Update Post' : 'Create Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
