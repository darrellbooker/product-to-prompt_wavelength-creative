export interface StaffMember {
  id: string
  name: string
  role: string
  avatarColor: string
  lastOneOnOneDate?: string
  askAboutNextTime?: string
  developmentGoals?: string[]
  recentWins?: string[]
  personalNotes: {
    family?: string
    hobbies?: string
    interests?: string
  }
  createdAt: string
}
