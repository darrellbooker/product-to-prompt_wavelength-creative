import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarBlank, UploadSimple, X, Image as ImageIcon, VideoCamera } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { CampaignPost, Platform, Client, PostStatus, MediaAttachment } from '@/types/campaign'
import { getPlatformName, PlatformIcon } from './PlatformIcon'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  const [media, setMedia] = useState<MediaAttachment[]>(editingPost?.media || [])
  const [errors, setErrors] = useState<{ content?: string; postDate?: string; clientId?: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingPost) {
      setPlatform(editingPost.platform)
      setContent(editingPost.content)
      setPostDate(new Date(editingPost.postDate))
      setClientId(editingPost.clientId)
      setStatus(editingPost.status)
      setMedia(editingPost.media || [])
    }
  }, [editingPost])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const maxSize = 10 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`)
        return
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const newMedia: MediaAttachment = {
          id: crypto.randomUUID(),
          url: e.target?.result as string,
          type: file.type.startsWith('video') ? 'video' : 'image',
          name: file.name,
          size: file.size,
        }
        setMedia((prev) => [...prev, newMedia])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id))
  }

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
      media: media.length > 0 ? media : undefined,
    })
    
    handleClose()
  }

  const handleClose = () => {
    setPlatform('twitter')
    setContent('')
    setPostDate(undefined)
    setClientId('')
    setStatus('draft')
    setMedia([])
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

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide font-medium">
              Media Attachments
            </Label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="media-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadSimple size={16} className="mr-2" />
                Upload Images or Videos
              </Button>
              
              {media.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="relative group rounded-lg overflow-hidden border bg-muted/30"
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-muted">
                          <VideoCamera size={32} className="text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveMedia(item.id)}
                      >
                        <X size={14} />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <div className="flex items-center gap-1 text-white text-xs">
                          {item.type === 'image' ? (
                            <ImageIcon size={12} weight="fill" />
                          ) : (
                            <VideoCamera size={12} weight="fill" />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Supports images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV) up to 10MB
              </p>
            </div>
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
