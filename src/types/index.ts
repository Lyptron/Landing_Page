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
  // Optional long-form content for the /work/[id] case-study page.
  // If absent, the case-study route returns notFound() for that slug.
  caseStudy?: CaseStudy
}

export interface CaseStudy {
  tagline:  string
  cover:    string              // /images/previews/*.png
  role:     string              // "Design + Full-stack engineering"
  timeline: string              // "6 weeks"
  overview: string              // 1–2 sentence intro under the hero
  challenge: {
    heading: string
    body:    string[]           // 1–3 short paragraphs
  }
  approach: {
    heading:     string
    body:        string[]
    highlights?: string[]       // 3–5 bullet points
  }
  outcomes: {
    heading: string
    metrics: { value: string; label: string }[]
    body?:   string[]
  }
  stack:    string[]            // detailed tech list for the sidebar
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
