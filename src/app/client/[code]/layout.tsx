import ClientPortalLayout from '@/components/layout/ClientPortalLayout'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { LogoProvider } from '@/lib/LogoContext'
import { ClientProjectProvider } from '@/lib/ClientProjectContext'

export default async function ProjectPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  return (
    <ThemeProvider defaultMode="dark">
      <LogoProvider>
        <ClientProjectProvider code={code}>
          <ClientPortalLayout projectCode={code}>
            {children}
          </ClientPortalLayout>
        </ClientProjectProvider>
      </LogoProvider>
    </ThemeProvider>
  )
}
