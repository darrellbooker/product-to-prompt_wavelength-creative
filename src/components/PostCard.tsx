import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PencilSimple, Trash, Image as ImageIcon, VideoCamera } from '@phosphor-icons/react'
import { format, isPast } from 'date-fns'
import { CampaignPost, Client } from '@/types/campaign'
import { PlatformIcon, getPlatformName } from './PlatformIcon'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: CampaignPost
  onEdit: (post: CampaignPost) => void
  onDelete: (id: string) => void
  client: Client | undefined
}

export function PostCard({ post, onEdit, onDelete, client }: PostCardProps) {
  const postDate = new Date(post.postDate)
  const isPastDate = isPast(postDate) && !isToday(postDate)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground'
      case 'scheduled':
        return 'bg-accent text-accent-foreground'
      case 'posted':
        return 'bg-primary text-primary-foreground'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'h-full transition-shadow hover:shadow-lg',
        isPastDate && 'opacity-60'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-medium">
                  {client?.name || 'Unknown Client'}
                </Badge>
                <Badge className={cn('text-xs', getStatusColor(post.status || 'draft'))}>
                  {(post.status || 'draft').charAt(0).toUpperCase() + (post.status || 'draft').slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {post.platforms && post.platforms.length > 1 ? (
                  <>
                    {post.platforms.map((platform) => (
                      <TooltipProvider key={platform}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border">
                              <PlatformIcon platform={platform} size={16} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{getPlatformName(platform)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    <Badge variant="secondary" className="text-xs">
                      {post.platforms.length} platforms
                    </Badge>
                  </>
                ) : (
                  <>
                    <PlatformIcon platform={post.platform} size={20} />
                    <span className="text-xs text-muted-foreground font-medium">
                      {getPlatformName(post.platform)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(post)}
              >
                <PencilSimple size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(post.id)}
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 space-y-3">
          {post.platformSpecificContent && post.platformSpecificContent.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Platform-specific content
                </Badge>
              </div>
              {post.platformSpecificContent.slice(0, 2).map((pc) => (
                <div key={pc.platform} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={pc.platform} size={14} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {getPlatformName(pc.platform)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-2 pl-5">
                    {pc.content}
                  </p>
                </div>
              ))}
              {post.platformSpecificContent.length > 2 && (
                <p className="text-xs text-muted-foreground pl-5">
                  +{post.platformSpecificContent.length - 2} more platform variants
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed line-clamp-4">
              {post.content}
            </p>
          )}

          {post.callToAction && (
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="secondary" className="text-xs font-medium px-3 py-1">
                CTA: {post.callToAction}
              </Badge>
            </div>
          )}
          
          {post.media && post.media.length > 0 && (
            <div className={cn(
              'grid gap-2',
              post.media.length === 1 && 'grid-cols-1',
              post.media.length === 2 && 'grid-cols-2',
              post.media.length >= 3 && 'grid-cols-2'
            )}>
              {post.media.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'relative rounded-md overflow-hidden bg-muted border',
                    post.media!.length === 1 && 'aspect-video',
                    post.media!.length > 1 && 'aspect-square'
                  )}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <VideoCamera size={24} className="text-muted-foreground" />
                    </div>
                  )}
                  {index === 3 && post.media!.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{post.media!.length - 4}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-1 right-1">
                    {item.type === 'image' ? (
                      <ImageIcon size={16} weight="fill" className="text-white drop-shadow-lg" />
                    ) : (
                      <VideoCamera size={16} weight="fill" className="text-white drop-shadow-lg" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-3 border-t flex-col items-start gap-2">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span className={cn(isPastDate && 'text-muted-foreground/70')}>
              {format(postDate, 'PPP')}
            </span>
            {isPastDate && (
              <Badge variant="outline" className="text-xs">
                Past
              </Badge>
            )}
          </div>
          {post.createdBy && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={post.createdBy.avatarUrl || ''} alt={post.createdBy.login || 'User'} />
                      <AvatarFallback className="text-[10px]">
                        {(post.createdBy.login || 'U').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {post.createdBy.login}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Created by {post.createdBy.login}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}
