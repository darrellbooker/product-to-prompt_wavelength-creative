import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PencilSimple, Trash, Copy } from '@phosphor-icons/react'
import { EmailTemplate } from '@/types/campaign'
import { format } from 'date-fns'

interface EmailTemplateCardProps {
  template: EmailTemplate
  onEdit: (template: EmailTemplate) => void
  onDelete: (id: string) => void
  onUse: (template: EmailTemplate) => void
}

export function EmailTemplateCard({ template, onEdit, onDelete, onUse }: EmailTemplateCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="p-5 h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">
              {template.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Created {format(new Date(template.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          <Badge variant="secondary" className="ml-2">
            Template
          </Badge>
        </div>

        <div className="space-y-2 flex-1 mb-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Subject
            </p>
            <p className="text-sm line-clamp-2 font-medium">
              {template.subjectLine}
            </p>
          </div>
          
          {template.previewText && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Preview
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.previewText}
              </p>
            </div>
          )}
          
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Body Preview
            </p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {template.emailBody}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t">
          <Button
            size="sm"
            variant="default"
            onClick={() => onUse(template)}
            className="flex-1"
          >
            <Copy size={16} className="mr-2" />
            Use Template
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(template)}
          >
            <PencilSimple size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(template.id)}
          >
            <Trash size={16} />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
