import { 
  TwitterLogo, 
  InstagramLogo, 
  FacebookLogo, 
  LinkedinLogo, 
  YoutubeLogo 
} from '@phosphor-icons/react'
import { Platform } from '@/types/campaign'

interface PlatformIconProps {
  platform: Platform
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
}

const platformConfig = {
  twitter: { icon: TwitterLogo, color: 'text-[#1DA1F2]' },
  instagram: { icon: InstagramLogo, color: 'text-[#E4405F]' },
  facebook: { icon: FacebookLogo, color: 'text-[#1877F2]' },
  linkedin: { icon: LinkedinLogo, color: 'text-[#0A66C2]' },
  youtube: { icon: YoutubeLogo, color: 'text-[#FF0000]' },
  tiktok: { icon: InstagramLogo, color: 'text-[#000000]' },
}

export function PlatformIcon({ platform, size = 24, weight = 'regular' }: PlatformIconProps) {
  const config = platformConfig[platform]
  const Icon = config.icon
  
  return <Icon size={size} weight={weight} className={config.color} />
}

export function getPlatformName(platform: Platform): string {
  const names: Record<Platform, string> = {
    twitter: 'Twitter',
    instagram: 'Instagram',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    tiktok: 'TikTok',
  }
  return names[platform]
}
