export interface StaffMember {
  id: string
  name: string
  role: string
  avatarColor: string
  personalNotes: {
    family?: string
    hobbies?: string
    interests?: string
  }
  createdAt: string
}
