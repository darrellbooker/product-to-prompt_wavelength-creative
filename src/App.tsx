import { useState, useMemo, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toaster } from '@/components/ui/sonner'
import { Plus, Funnel, ChatsCircle, Envelope, Users, ChartLineUp, CalendarBlank, X, MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { CampaignPost, Platform, Client } from '@/types/campaign'
import { PostCard } from '@/components/PostCard'
import { PostFormDialog } from '@/components/PostFormDialog'
import { PlatformIcon, getPlatformName } from '@/components/PlatformIcon'
import { EmailManager } from '@/components/EmailManager'
import { StaffCultureManager } from '@/components/StaffCultureManager'
import { ROIManager } from '@/components/ROIManager'
import { cn } from '@/lib/utils'

const platforms: Platform[] = ['twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'tiktok']

const defaultClients: Client[] = [
  { id: '1', name: 'Acme Corp' },
  { id: '2', name: 'TechStart Inc' },
  { id: '3', name: 'Global Solutions' },
  { id: '4', name: 'Innovate Labs' },
  { id: '5', name: 'Digital Dynamics' },
]

function App() {
  const [posts, setPosts] = useKV<CampaignPost[]>('campaign-posts', [])
  const [clients] = useKV<Client[]>('clients', defaultClients)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<CampaignPost | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all')
  const [filterClient, setFilterClient] = useState<string>('all')
  const [filterDateStart, setFilterDateStart] = useState<string>('')
  const [filterDateEnd, setFilterDateEnd] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<{ login: string; avatarUrl: string }>({ login: 'user', avatarUrl: '' })

  useEffect(() => {
    window.spark.user().then((user) => {
      setCurrentUser({
        login: user?.login || 'user',
        avatarUrl: user?.avatarUrl || '',
      })
    }).catch(() => {
      setCurrentUser({ login: 'user', avatarUrl: '' })
    })
  }, [])

  const handleSavePost = async (postData: Omit<CampaignPost, 'id' | 'createdAt' | 'createdBy'>) => {
    let user = currentUser
    if (!user || !user.login) {
      try {
        const userInfo = await window.spark.user()
        user = { login: userInfo?.login || 'user', avatarUrl: userInfo?.avatarUrl || '' }
      } catch {
        user = { login: 'user', avatarUrl: '' }
      }
    }
    
    if (editingPost) {
      setPosts((currentPosts) =>
        (currentPosts || []).map((p) =>
          p.id === editingPost.id
            ? { 
                ...postData, 
                id: editingPost.id, 
                createdAt: editingPost.createdAt,
                createdBy: editingPost.createdBy 
              }
            : p
        )
      )
      toast.success('Post updated successfully')
      setEditingPost(undefined)
    } else {
      const newPost: CampaignPost = {
        ...postData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdBy: {
          login: user.login,
          avatarUrl: user.avatarUrl,
        },
      }
      setPosts((currentPosts) => [...(currentPosts || []), newPost])
      toast.success('Post created successfully')
    }
    setIsFormOpen(false)
  }

  const getClientById = (clientId: string): Client | undefined => {
    return clients?.find((c) => c.id === clientId)
  }

  const handleEditPost = (post: CampaignPost) => {
    setEditingPost(post)
    setIsFormOpen(true)
  }

  const handleDeletePost = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      setPosts((currentPosts) => (currentPosts || []).filter((p) => p.id !== deleteId))
      toast.success('Post deleted')
      setDeleteId(null)
    }
  }

  const handleNewPost = () => {
    setEditingPost(undefined)
    setIsFormOpen(true)
  }

  const filteredPosts = useMemo(() => {
    const currentPosts = posts || []
    let filtered = currentPosts
    
    if (filterPlatform !== 'all') {
      filtered = filtered.filter((p) => p.platform === filterPlatform)
    }
    
    if (filterClient !== 'all') {
      filtered = filtered.filter((p) => p.clientId === filterClient)
    }
    
    if (filterDateStart) {
      const startDate = new Date(filterDateStart)
      startDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((p) => new Date(p.postDate) >= startDate)
    }
    
    if (filterDateEnd) {
      const endDate = new Date(filterDateEnd)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((p) => new Date(p.postDate) <= endDate)
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((p) => {
        const contentMatch = p.content.toLowerCase().includes(query)
        const hashtagMatch = p.content.toLowerCase().match(/#\w+/g)?.some(tag => tag.includes(query))
        const ctaMatch = p.callToAction?.toLowerCase().includes(query)
        return contentMatch || hashtagMatch || ctaMatch
      })
    }
    
    return filtered.sort((a, b) => 
      new Date(a.postDate).getTime() - new Date(b.postDate).getTime()
    )
  }, [posts, filterPlatform, filterClient, filterDateStart, filterDateEnd, searchQuery])

  const platformStats = useMemo(() => {
    const stats: Record<Platform, number> = {
      twitter: 0,
      instagram: 0,
      facebook: 0,
      linkedin: 0,
      youtube: 0,
      tiktok: 0,
    }
    const currentPosts = posts || []
    currentPosts.forEach((post) => {
      stats[post.platform]++
    })
    return stats
  }, [posts])

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <header className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Operations Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your social media and email campaigns
            </p>
          </div>
        </header>

        <Tabs defaultValue="social" className="w-full">
          <TabsList className="mb-6 w-full grid grid-cols-2 sm:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="social" className="gap-1 sm:gap-2 flex-col sm:flex-row h-auto py-2 sm:py-1.5">
              <ChatsCircle size={18} className="sm:size-4" />
              <span className="text-xs sm:text-sm">Social</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1 sm:gap-2 flex-col sm:flex-row h-auto py-2 sm:py-1.5">
              <Envelope size={18} className="sm:size-4" />
              <span className="text-xs sm:text-sm">Email</span>
            </TabsTrigger>
            <TabsTrigger value="roi" className="gap-1 sm:gap-2 flex-col sm:flex-row h-auto py-2 sm:py-1.5">
              <ChartLineUp size={18} className="sm:size-4" />
              <span className="text-xs sm:text-sm">ROI</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-1 sm:gap-2 flex-col sm:flex-row h-auto py-2 sm:py-1.5">
              <Users size={18} className="sm:size-4" />
              <span className="text-xs sm:text-sm">Staff</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="mt-0">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Social Media Planner</h2>
                  <p className="text-sm text-muted-foreground">
                    Organize and schedule your social media content
                  </p>
                </div>
                <Button 
                  onClick={handleNewPost}
                  size="lg"
                  className="shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Plus size={20} weight="bold" className="mr-2" />
                  Add Post
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Total Posts
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {posts?.length || 0}
                  </div>
                </Card>

                {Object.entries(platformStats)
                  .filter(([_, count]) => count > 0)
                  .slice(0, 3)
                  .map(([platform, count]) => (
                    <Card key={platform} className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <PlatformIcon platform={platform as Platform} size={16} />
                        <div className="text-sm font-medium text-muted-foreground">
                          {getPlatformName(platform as Platform)}
                        </div>
                      </div>
                      <div className="text-3xl font-bold">
                        {count}
                      </div>
                    </Card>
                  ))}
              </div>

              <Separator />

              <div className="relative">
                <MagnifyingGlass 
                  size={20} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                  weight="duotone"
                />
                <Input
                  id="search-posts"
                  type="text"
                  placeholder="Search posts by content or hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base bg-card shadow-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>

              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-4">
                  <Funnel size={18} className="text-primary" weight="duotone" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Filters</h3>
                  {(filterPlatform !== 'all' || filterClient !== 'all' || filterDateStart || filterDateEnd || searchQuery) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterPlatform('all')
                        setFilterClient('all')
                        setFilterDateStart('')
                        setFilterDateEnd('')
                        setSearchQuery('')
                      }}
                      className="ml-auto h-8 text-xs"
                    >
                      <X size={14} className="mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                      Platform
                    </Label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant={filterPlatform === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterPlatform('all')}
                        className="h-9"
                      >
                        All Platforms
                      </Button>
                      {platforms.map((platform) => (
                        <Button
                          key={platform}
                          variant={filterPlatform === platform ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterPlatform(platform)}
                          className={cn(
                            'h-9',
                            filterPlatform === platform && 'shadow-md'
                          )}
                        >
                          <PlatformIcon platform={platform} size={16} />
                          <span className="ml-2 hidden sm:inline">
                            {getPlatformName(platform)}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="client-filter" className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                        Client
                      </Label>
                      <Select value={filterClient} onValueChange={setFilterClient}>
                        <SelectTrigger id="client-filter" className="h-10">
                          <SelectValue placeholder="All Clients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Clients</SelectItem>
                          {(clients || []).map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date-start" className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                        Start Date
                      </Label>
                      <div className="relative">
                        <Input
                          id="date-start"
                          type="date"
                          value={filterDateStart}
                          onChange={(e) => setFilterDateStart(e.target.value)}
                          className="h-10"
                        />
                        <CalendarBlank size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="date-end" className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                        End Date
                      </Label>
                      <div className="relative">
                        <Input
                          id="date-end"
                          type="date"
                          value={filterDateEnd}
                          onChange={(e) => setFilterDateEnd(e.target.value)}
                          className="h-10"
                        />
                        <CalendarBlank size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {(filterClient !== 'all' || filterDateStart || filterDateEnd || searchQuery) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t flex-wrap">
                      <span className="font-medium">Active filters:</span>
                      {searchQuery && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                          Search: "{searchQuery}"
                        </span>
                      )}
                      {filterClient !== 'all' && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                          {clients?.find(c => c.id === filterClient)?.name}
                        </span>
                      )}
                      {filterDateStart && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                          From: {new Date(filterDateStart).toLocaleDateString()}
                        </span>
                      )}
                      {filterDateEnd && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                          To: {new Date(filterDateEnd).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mb-6 flex justify-center">
                    <svg
                      className="w-32 h-32 text-muted-foreground/20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 6v6l4 2"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">
                    {(posts || []).length === 0 
                      ? 'No posts yet'
                      : 'No posts match your filters'
                    }
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {(posts || []).length === 0 
                      ? 'Get started by creating your first campaign post'
                      : 'Try adjusting your filter criteria to see more results'
                    }
                  </p>
                  {(posts || []).length === 0 ? (
                    <Button onClick={handleNewPost} size="lg">
                      <Plus size={20} weight="bold" className="mr-2" />
                      Create Your First Post
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        setFilterPlatform('all')
                        setFilterClient('all')
                        setFilterDateStart('')
                        setFilterDateEnd('')
                        setSearchQuery('')
                      }} 
                      size="lg"
                      variant="outline"
                    >
                      <X size={20} weight="bold" className="mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                        client={getClientById(post.clientId)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="email" className="mt-0">
            <EmailManager clients={clients || []} />
          </TabsContent>

          <TabsContent value="roi" className="mt-0">
            <ROIManager clients={clients || []} />
          </TabsContent>

          <TabsContent value="staff" className="mt-0">
            <StaffCultureManager />
          </TabsContent>
        </Tabs>

        <PostFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) {
              setEditingPost(undefined)
            }
          }}
          onSave={handleSavePost}
          editingPost={editingPost}
          clients={clients || []}
        />

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This post will be permanently removed from your campaign.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
    </>
  )
}

export default App
