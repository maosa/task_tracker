import ManagerTaskView from '@/components/manager/ManagerTaskView'

export default async function ManagerTaskPage({
  params,
}: {
  params: Promise<{ adminUserId: string }>
}) {
  const { adminUserId } = await params
  return <ManagerTaskView adminUserId={adminUserId} />
}
