import ClientPortalLayout from '@/components/layout/ClientPortalLayout'

export default async function ProjectPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  
  return (
    <ClientPortalLayout projectCode={code}>
      {children}
    </ClientPortalLayout>
  )
}
