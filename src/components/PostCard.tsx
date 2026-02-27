import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PencilSimple, Trash } from '@phosphor-icons/react'
import { format, isPast } from 'date-fns'
import { CampaignPost } from '@/types/campaign'
import { PlatformIcon, getPlatformName } from './PlatformIcon'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: CampaignPost
  onEdit: (post: CampaignPost) => void
  onDelete: (id: string) => void
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const postDate = new Date(post.postDate)
  const isPastDate = isPast(postDate) && !isToday(postDate)

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
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <PlatformIcon platform={post.platform} size={24} />
              <Badge variant="secondary" className="text-xs font-medium">
                {getPlatformName(post.platform)}
              </Badge>
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
        
        <CardContent className="pb-3">
          <p className="text-sm leading-relaxed line-clamp-4">
            {post.content}
          </p>
        </CardContent>
        
        <CardFooter className="pt-3 border-t">
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
