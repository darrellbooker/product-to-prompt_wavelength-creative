import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CalendarBlank, UploadSimple, X, Image as ImageIcon, VideoCamera } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { CampaignPost, Platform, Client, PostStatus, MediaAttachment, PlatformContent } from '@/types/campaign'
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    editingPost?.platforms || (editingPost?.platform ? [editingPost.platform] : [])
  )
  const [contentMode, setContentMode] = useState<'unified' | 'custom'>(
    editingPost?.platformSpecificContent ? 'custom' : 'unified'
  )
  const [unifiedContent, setUnifiedContent] = useState(editingPost?.content || '')
  const [unifiedCallToAction, setUnifiedCallToAction] = useState(editingPost?.callToAction || '')
  const [platformContents, setPlatformContents] = useState<Map<Platform, PlatformContent>>(
    new Map(
      editingPost?.platformSpecificContent?.map(pc => [pc.platform, pc]) || []
    )
  )
  const [postDate, setPostDate] = useState<Date | undefined>(
    editingPost?.postDate ? new Date(editingPost.postDate) : undefined
  )
  const [clientId, setClientId] = useState<string>(editingPost?.clientId || '')
  const [status, setStatus] = useState<PostStatus>(editingPost?.status || 'draft')
  const [media, setMedia] = useState<MediaAttachment[]>(editingPost?.media || [])
  const [errors, setErrors] = useState<{ platforms?: string; content?: string; postDate?: string; clientId?: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingPost) {
      setSelectedPlatforms(editingPost.platforms || (editingPost.platform ? [editingPost.platform] : []))
      setContentMode(editingPost.platformSpecificContent ? 'custom' : 'unified')
      setUnifiedContent(editingPost.content)
      setUnifiedCallToAction(editingPost.callToAction || '')
      setPlatformContents(
        new Map(editingPost.platformSpecificContent?.map(pc => [pc.platform, pc]) || [])
      )
      setPostDate(new Date(editingPost.postDate))
      setClientId(editingPost.clientId)
      setStatus(editingPost.status)
      setMedia(editingPost.media || [])
    }
  }, [editingPost])

  useEffect(() => {
    if (contentMode === 'custom' && selectedPlatforms.length > 0) {
      const newPlatformContents = new Map(platformContents)
      selectedPlatforms.forEach(platform => {
        if (!newPlatformContents.has(platform)) {
          newPlatformContents.set(platform, {
            platform,
            content: unifiedContent,
            callToAction: unifiedCallToAction || undefined,
          })
        }
      })
      setPlatformContents(newPlatformContents)
    }
  }, [contentMode, selectedPlatforms])

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform)
      } else {
        return [...prev, platform]
      }
    })
    setErrors(prev => ({ ...prev, platforms: undefined }))
  }

  const updatePlatformContent = (platform: Platform, field: 'content' | 'callToAction', value: string) => {
    setPlatformContents(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(platform) || { platform, content: '', callToAction: undefined }
      newMap.set(platform, {
        ...existing,
        [field]: value || undefined,
      })
      return newMap
    })
    setErrors(prev => ({ ...prev, content: undefined }))
  }

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
    const newErrors: { platforms?: string; content?: string; postDate?: string; clientId?: string } = {}
    
    if (selectedPlatforms.length === 0) {
      newErrors.platforms = 'Select at least one platform'
    }

    if (contentMode === 'unified' && !unifiedContent.trim()) {
      newErrors.content = 'Content is required'
    }

    if (contentMode === 'custom') {
      let hasContent = false
      for (const platform of selectedPlatforms) {
        const content = platformContents.get(platform)
        if (content && content.content.trim()) {
          hasContent = true
          break
        }
      }
      if (!hasContent) {
        newErrors.content = 'At least one platform must have content'
      }
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

    const basePost: Omit<CampaignPost, 'id' | 'createdAt' | 'createdBy'> = {
      platform: selectedPlatforms[0],
      platforms: selectedPlatforms,
      content: contentMode === 'unified' ? unifiedContent.trim() : (platformContents.get(selectedPlatforms[0])?.content || ''),
      postDate: postDate!.toISOString(),
      clientId,
      status,
      callToAction: contentMode === 'unified' ? (unifiedCallToAction.trim() || undefined) : undefined,
      media: media.length > 0 ? media : undefined,
    }

    if (contentMode === 'custom') {
      const platformSpecificContent: PlatformContent[] = []
      selectedPlatforms.forEach(platform => {
        const content = platformContents.get(platform)
        if (content && content.content.trim()) {
          platformSpecificContent.push({
            platform,
            content: content.content.trim(),
            callToAction: content.callToAction?.trim() || undefined,
          })
        }
      })
      basePost.platformSpecificContent = platformSpecificContent
    }
    
    onSave(basePost)
    handleClose()
  }

  const handleClose = () => {
    setSelectedPlatforms([])
    setContentMode('unified')
    setUnifiedContent('')
    setUnifiedCallToAction('')
    setPlatformContents(new Map())
    setPostDate(undefined)
    setClientId('')
    setStatus('draft')
    setMedia([])
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </DialogTitle>
          <DialogDescription>
            {editingPost ? 'Update your campaign post details below.' : 'Create posts for one or multiple platforms.'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6 py-4">
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

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide font-medium">
                Select Platforms
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <div
                    key={platform}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                      selectedPlatforms.includes(platform)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => togglePlatform(platform)}
                  >
                    <Checkbox
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={() => togglePlatform(platform)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <PlatformIcon platform={platform} size={20} />
                    <span className="text-sm font-medium">{getPlatformName(platform)}</span>
                  </div>
                ))}
              </div>
              {errors.platforms && (
                <p className="text-sm text-destructive">{errors.platforms}</p>
              )}
              {selectedPlatforms.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Selected:</span>
                  {selectedPlatforms.map(platform => (
                    <Badge key={platform} variant="secondary" className="gap-1">
                      <PlatformIcon platform={platform} size={14} />
                      {getPlatformName(platform)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {selectedPlatforms.length > 0 && (
              <>
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide font-medium">
                    Content Strategy
                  </Label>
                  <Tabs value={contentMode} onValueChange={(v) => setContentMode(v as 'unified' | 'custom')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="unified">Unified Content</TabsTrigger>
                      <TabsTrigger value="custom">Platform-Specific</TabsTrigger>
                    </TabsList>

                    <TabsContent value="unified" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="unified-content" className="text-xs uppercase tracking-wide font-medium">
                          Content
                        </Label>
                        <Textarea
                          id="unified-content"
                          placeholder="Write your message that will be posted to all selected platforms..."
                          value={unifiedContent}
                          onChange={(e) => {
                            setUnifiedContent(e.target.value)
                            setErrors((prev) => ({ ...prev, content: undefined }))
                          }}
                          rows={6}
                          className={cn(errors.content && 'border-destructive')}
                        />
                        {errors.content && (
                          <p className="text-sm text-destructive">{errors.content}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{unifiedContent.length} characters</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unified-cta" className="text-xs uppercase tracking-wide font-medium">
                          Call to Action <span className="text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Input
                          id="unified-cta"
                          placeholder="e.g. Learn More, Shop Now, Sign Up..."
                          value={unifiedCallToAction}
                          onChange={(e) => setUnifiedCallToAction(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Add a compelling action for your audience
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Customize content for each platform to optimize engagement
                      </p>
                      {selectedPlatforms.map(platform => {
                        const content = platformContents.get(platform) || { platform, content: '', callToAction: undefined }
                        return (
                          <div key={platform} className="space-y-3 p-4 rounded-lg border bg-muted/20">
                            <div className="flex items-center gap-2 mb-2">
                              <PlatformIcon platform={platform} size={20} />
                              <h4 className="font-semibold">{getPlatformName(platform)}</h4>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs uppercase tracking-wide font-medium">
                                Content
                              </Label>
                              <Textarea
                                placeholder={`Write content for ${getPlatformName(platform)}...`}
                                value={content.content}
                                onChange={(e) => updatePlatformContent(platform, 'content', e.target.value)}
                                rows={4}
                                className="resize-none"
                              />
                              <p className="text-xs text-muted-foreground">{content.content.length} characters</p>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs uppercase tracking-wide font-medium">
                                Call to Action <span className="text-muted-foreground font-normal">(Optional)</span>
                              </Label>
                              <Input
                                placeholder="e.g. Learn More, Shop Now..."
                                value={content.callToAction || ''}
                                onChange={(e) => updatePlatformContent(platform, 'callToAction', e.target.value)}
                              />
                            </div>
                          </div>
                        )
                      })}
                      {errors.content && (
                        <p className="text-sm text-destructive">{errors.content}</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}

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
        </ScrollArea>

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
