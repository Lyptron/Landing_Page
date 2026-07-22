'use client'

import React, { createContext, useContext } from 'react'
import type {
  ActivityRow,
  AnnouncementRow,
  ApprovalRow,
  AssignedTeamMember,
  DeploymentRow,
  DocumentRow,
  FeedbackRow,
  GalleryItemRow,
  MeetingRow,
  MilestoneRow,
  PaymentRow,
  ProjectRow,
  TeamMemberRow,
} from '@/lib/db-types'

export interface ProjectContextType {
  project: ProjectRow | null
  loading: boolean
  loadProject: () => Promise<void>
  saving: boolean
  name: string
  setName: (n: string) => void
  clientEmail: string
  setClientEmail: (e: string) => void
  description: string
  setDescription: (d: string) => void
  status: string
  setStatus: (s: string) => void
  stage: string
  setStage: (s: string) => void
  progress: number
  setProgress: (p: number) => void
  accessCode: string | null
  setAccessCode: (c: string | null) => void
  saveProject: () => Promise<void>
  projectId: string
  teamAssigned: AssignedTeamMember[]
  setTeamAssigned: React.Dispatch<React.SetStateAction<AssignedTeamMember[]>>
  allTeamMembers: TeamMemberRow[]
  milestones: MilestoneRow[]
  setMilestones: React.Dispatch<React.SetStateAction<MilestoneRow[]>>
  payments: PaymentRow[]
  setPayments: React.Dispatch<React.SetStateAction<PaymentRow[]>>
  approvals: ApprovalRow[]
  setApprovals: React.Dispatch<React.SetStateAction<ApprovalRow[]>>
  gallery: GalleryItemRow[]
  setGallery: React.Dispatch<React.SetStateAction<GalleryItemRow[]>>
  documents: DocumentRow[]
  setDocuments: React.Dispatch<React.SetStateAction<DocumentRow[]>>
  meetings: MeetingRow[]
  setMeetings: React.Dispatch<React.SetStateAction<MeetingRow[]>>
  deployments: DeploymentRow[]
  setDeployments: React.Dispatch<React.SetStateAction<DeploymentRow[]>>
  activities: ActivityRow[]
  setActivities: React.Dispatch<React.SetStateAction<ActivityRow[]>>
  announcements: AnnouncementRow[]
  setAnnouncements: React.Dispatch<React.SetStateAction<AnnouncementRow[]>>
  feedback: FeedbackRow[]
  setFeedback: React.Dispatch<React.SetStateAction<FeedbackRow[]>>
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProject must be used within a ProjectProvider')
  return context
}
