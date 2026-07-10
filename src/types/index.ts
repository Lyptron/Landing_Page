export type CursorState = 'default' | 'hover' | 'cta' | 'drag'

export type ChapterID = 'hero' | 'about' | 'services' | 'work' | 'team' | 'process' | 'pricing' | 'cta'

export interface Service {
  id:       string
  number:   string
  icon:     string
  name:     string
  tagline:  string
  desc:     string
  helps:    string[]
  works:    { name: string; badge: string; desc: string; result: string }[]
  forYou:   string[]
  stack:    string[]
  url?:     string
}

export interface Project {
  id:      string
  name:    string
  type:    string
  year:    string
  desc:    string
  result:  string
  tags:    string[]
  size:    'large' | 'medium' | 'small' | 'wide'
  accent:  string
  accentGlow: string
  number:  string
  // Live deployed URL — when present, the Work section renders a real
  // embedded preview instead of the placeholder "Preview" mockup.
  url?:    string
}

export interface TeamMember {
  id: string
  initials: string
  name: string
  role: string
  skills: string[]
  bio: string
  expertise: string[]
  accent: string
  image?: string
}

export interface ProcessStep {
  number: string
  title: string
  desc: string
  details: string[]
}
