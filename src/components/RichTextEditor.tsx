import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TextB, 
  TextItalic, 
  TextUnderline,
  ListBullets, 
  ListNumbers,
  Link as LinkIcon,
  Image as ImageIcon,
  TextHOne,
  TextHTwo,
  TextHThree,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  PaintBucket,
  Code
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Start writing your email...', 
  className,
  minHeight = '400px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [currentFormat, setCurrentFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    h3: false,
  })

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  useEffect(() => {
    const updateFormatState = () => {
      setCurrentFormat({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        h1: document.queryCommandValue('formatBlock') === 'h1',
        h2: document.queryCommandValue('formatBlock') === 'h2',
        h3: document.queryCommandValue('formatBlock') === 'h3',
      })
    }

    const editor = editorRef.current
    if (editor) {
      editor.addEventListener('keyup', updateFormatState)
      editor.addEventListener('mouseup', updateFormatState)
      return () => {
        editor.removeEventListener('keyup', updateFormatState)
        editor.removeEventListener('mouseup', updateFormatState)
      }
    }
  }, [])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const handleHeading = (tag: string) => {
    execCommand('formatBlock', tag)
  }

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
      if (linkText.trim()) {
        const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #6366f1; text-decoration: underline;">${linkText}</a>`
        execCommand('insertHTML', html)
      } else {
        execCommand('createLink', url)
      }
      setLinkUrl('')
      setLinkText('')
      setShowLinkDialog(false)
    }
  }

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      const url = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`
      const html = `<img src="${url}" alt="${imageAlt || 'Image'}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0;" />`
      execCommand('insertHTML', html)
      setImageUrl('')
      setImageAlt('')
      setShowImageDialog(false)
    }
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    execCommand('foreColor', color)
  }

  const predefinedColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#4B5563' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#10B981' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Pink', value: '#EC4899' },
  ]

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-card', className)}>
      <div className="border-b bg-muted/30 p-2 space-y-2">
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant={currentFormat.bold ? 'default' : 'ghost'}
            size="sm"
            onClick={() => execCommand('bold')}
            className="h-9 w-9 p-0"
            title="Bold (Ctrl+B)"
          >
            <TextB size={18} weight="bold" />
          </Button>

          <Button
            type="button"
            variant={currentFormat.italic ? 'default' : 'ghost'}
            size="sm"
            onClick={() => execCommand('italic')}
            className="h-9 w-9 p-0"
            title="Italic (Ctrl+I)"
          >
            <TextItalic size={18} weight="bold" />
          </Button>

          <Button
            type="button"
            variant={currentFormat.underline ? 'default' : 'ghost'}
            size="sm"
            onClick={() => execCommand('underline')}
            className="h-9 w-9 p-0"
            title="Underline (Ctrl+U)"
          >
            <TextUnderline size={18} weight="bold" />
          </Button>

          <Separator orientation="vertical" className="h-9 mx-1" />

          <Button
            type="button"
            variant={currentFormat.h1 ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleHeading('h1')}
            className="h-9 w-9 p-0"
            title="Heading 1"
          >
            <TextHOne size={18} weight="bold" />
          </Button>

          <Button
            type="button"
            variant={currentFormat.h2 ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleHeading('h2')}
            className="h-9 w-9 p-0"
            title="Heading 2"
          >
            <TextHTwo size={18} weight="bold" />
          </Button>

          <Button
            type="button"
            variant={currentFormat.h3 ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleHeading('h3')}
            className="h-9 w-9 p-0"
            title="Heading 3"
          >
            <TextHThree size={18} weight="bold" />
          </Button>

          <Separator orientation="vertical" className="h-9 mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            className="h-9 w-9 p-0"
            title="Bullet List"
          >
            <ListBullets size={18} weight="bold" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            className="h-9 w-9 p-0"
            title="Numbered List"
          >
            <ListNumbers size={18} weight="bold" />
          </Button>

          <Separator orientation="vertical" className="h-9 mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyLeft')}
            className="h-9 w-9 p-0"
            title="Align Left"
          >
            <TextAlignLeft size={18} weight="bold" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyCenter')}
            className="h-9 w-9 p-0"
            title="Align Center"
          >
            <TextAlignCenter size={18} weight="bold" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyRight')}
            className="h-9 w-9 p-0"
            title="Align Right"
          >
            <TextAlignRight size={18} weight="bold" />
          </Button>

          <Separator orientation="vertical" className="h-9 mx-1" />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                title="Text Color"
              >
                <PaintBucket size={18} weight="fill" style={{ color: selectedColor }} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-3">
                <Label>Text Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleColorChange(color.value)}
                      className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: color.value,
                        borderColor: selectedColor === color.value ? '#6366f1' : '#e5e7eb'
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-9 mx-1" />

          <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                title="Insert Link"
              >
                <LinkIcon size={18} weight="bold" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="link-text">Link Text (optional)</Label>
                  <Input
                    id="link-text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Click here"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL *</Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowLinkDialog(false)
                      setLinkUrl('')
                      setLinkText('')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleInsertLink}
                    disabled={!linkUrl.trim()}
                    className="flex-1"
                  >
                    Insert Link
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={showImageDialog} onOpenChange={setShowImageDialog}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                title="Insert Image"
              >
                <ImageIcon size={18} weight="bold" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="image-url">Image URL *</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-alt">Alt Text (optional)</Label>
                  <Input
                    id="image-alt"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Description of image"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowImageDialog(false)
                      setImageUrl('')
                      setImageAlt('')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleInsertImage}
                    disabled={!imageUrl.trim()}
                    className="flex-1"
                  >
                    Insert Image
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand('removeFormat')}
            className="h-9 px-3"
            title="Clear Formatting"
          >
            <Code size={18} weight="bold" className="mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'p-4 outline-none overflow-y-auto prose prose-sm max-w-none',
          'focus:bg-muted/10',
          '[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-6',
          '[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-5',
          '[&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:mt-4',
          '[&>p]:mb-3 [&>p]:leading-relaxed',
          '[&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-3',
          '[&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-3',
          '[&>li]:mb-1',
          '[&_a]:text-primary [&_a]:underline [&_a]:cursor-pointer',
          '[&_img]:rounded-lg [&_img]:my-4',
          'text-foreground'
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {!isFocused && editorRef.current?.textContent?.trim() === '' && (
        <div 
          className="absolute top-[60px] left-4 text-muted-foreground pointer-events-none"
          style={{ userSelect: 'none' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}
