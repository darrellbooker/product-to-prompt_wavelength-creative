export type Platform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok'
export type PostStatus = 'draft' | 'scheduled' | 'posted'
export type EmailStatus = 'draft' | 'scheduled' | 'sent'

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

export interface PlatformContent {
  platform: Platform
  content: string
  callToAction?: string
}

export interface CampaignPost {
  id: string
  platform: Platform
  platforms?: Platform[]
  content: string
  platformSpecificContent?: PlatformContent[]
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

export interface EmailTemplate {
  id: string
  name: string
  subjectLine: string
  previewText: string
  emailBody: string
  createdAt: string
  updatedAt: string
  createdBy: {
    login: string
    avatarUrl?: string
  }
}

export interface RecipientListItem {
  email: string
  name?: string
}

export interface SavedRecipientList {
  id: string
  name: string
  recipients: RecipientListItem[]
  createdAt: string
  updatedAt: string
}

export interface EmailCampaign {
  id: string
  clientId: string
  subjectLine: string
  previewText: string
  emailBody: string
  sendDate: string
  createdAt: string
  status: EmailStatus
  templateId?: string
  recipients: RecipientListItem[]
  recipientListId?: string
  createdBy: {
    login: string
    avatarUrl?: string
  }
}

export type ROIPlatform = 'Meta' | 'Google' | 'LinkedIn' | 'Email'

export interface ROICampaign {
  id: string
  name: string
  clientId: string
  platform: ROIPlatform
  budget: number
  startDate: string
  endDate: string
  createdAt: string
  createdBy: {
    login: string
    avatarUrl?: string
  }
  revenue?: number
  totalSpend?: number
  impressions?: number
  clicks?: number
  conversions?: number
}
