import { useState, useMemo, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Funnel, ChatsCircle, Envelope } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { CampaignPost, Platform, Client } from '@/types/campaign'
import { PostCard } from '@/components/PostCard'
import { PostFormDialog } from '@/components/PostFormDialog'
import { PlatformIcon, getPlatformName } from '@/components/PlatformIcon'
import { EmailManager } from '@/components/EmailManager'
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
    const filtered = filterPlatform === 'all' 
      ? currentPosts 
      : currentPosts.filter((p) => p.platform === filterPlatform)
    
    return filtered.sort((a, b) => 
      new Date(a.postDate).getTime() - new Date(b.postDate).getTime()
    )
  }, [posts, filterPlatform])

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
          <TabsList className="mb-6">
            <TabsTrigger value="social" className="gap-2">
              <ChatsCircle size={18} />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Envelope size={18} />
              Email Campaigns
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

              <div className="flex items-center gap-2 flex-wrap">
                <Funnel size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Filter:
                </span>
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
                    {filterPlatform === 'all' ? 'No posts yet' : `No ${getPlatformName(filterPlatform)} posts`}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {filterPlatform === 'all' 
                      ? 'Get started by creating your first campaign post'
                      : `Create a post for ${getPlatformName(filterPlatform)} to see it here`
                    }
                  </p>
                  <Button onClick={handleNewPost} size="lg">
                    <Plus size={20} weight="bold" className="mr-2" />
                    Create Your First Post
                  </Button>
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
  )
}

export default App
