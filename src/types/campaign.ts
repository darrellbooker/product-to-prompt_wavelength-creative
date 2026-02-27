export type Platform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok'

export interface CampaignPost {
  id: string
  platform: Platform
  content: string
  postDate: string
  createdAt: string
}
