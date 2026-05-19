export type Platform = 'instagram' | 'linkedin' | 'twitter' | 'all'

export interface GeneratedContent {
  instagram: string
  linkedin: string
  twitter: string
  hashtags: string[]
  carousel: string[]
}

export interface Generation {
  id: string
  user_id: string
  prompt: string
  platform: string
  output: string
  created_at: string
}

export interface ScheduledPost {
  id: string
  user_id: string
  content: string
  platform: Platform
  scheduled_time: string
  status: 'pending' | 'published' | 'failed'
  created_at: string
}

export interface SocialAccount {
  id: string
  user_id: string
  platform: Platform
  access_token: string
  refresh_token: string
  created_at: string
}

export interface AnalyticsStats {
  totalGenerations: number
  scheduledPosts: number
  publishedPosts: number
  topPlatform: string
}

export interface GenerateFormData {
  topic: string
  product: string
  blogUrl: string
  tone: string
}