export type Platform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok'
export type PostStatus = 'draft' | 'scheduled' | 'posted'

export interface Client {
  id: string
  name: string
}

export interface MediaAttachment {
  id: string
  url: string
  type: 'image' | 'video'
  name: string
  size: number
}

export interface CampaignPost {
  id: string
  platform: Platform
  content: string
  postDate: string
  createdAt: string
  clientId: string
  status: PostStatus
  callToAction?: string
  media?: MediaAttachment[]
  createdBy?: {
    login: string
    avatarUrl?: string
  }
}
