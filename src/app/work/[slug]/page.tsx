import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { projects } from '@/data/projects'
import CaseStudyBody from '@/components/sections/CaseStudyBody'

const SITE_URL = 'https://lyptron.com'

// Pre-render one static page per project at build time. Only projects
// that have a caseStudy block get a route — unknown slugs 404.
export function generateStaticParams() {
  return projects
    .filter((p) => !!p.caseStudy)
    .map((p) => ({ slug: p.id }))
}

interface Params {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((p) => p.id === slug)
  if (!project?.caseStudy) return {}

  const title = `${project.name} — ${project.type} case study`
  const description = project.caseStudy.tagline

  return {
    title,
    description,
    alternates: { canonical: `/work/${project.id}` },
    openGraph: {
      title: `${title} — Lyptron`,
      description,
      url: `${SITE_URL}/work/${project.id}`,
      type: 'article',
      images: [{ url: project.caseStudy.cover, alt: `${project.name} cover` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [project.caseStudy.cover],
    },
  }
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params
  const project = projects.find((p) => p.id === slug)
  if (!project?.caseStudy) notFound()

  // Next case study for the bottom nav — cycle back to the first when
  // we're on the last project.
  const idx = projects.findIndex((p) => p.id === project.id)
  const nextProject = projects
    .slice(idx + 1)
    .concat(projects.slice(0, idx))
    .find((p) => !!p.caseStudy)

  return <CaseStudyBody project={project} nextProject={nextProject} />
}
