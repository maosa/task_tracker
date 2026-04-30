import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

// Phase 7: enabled so sidebar shows Manager view. Full auth mode will read from manager_relationships.
const HAS_MANAGER_RELATIONSHIPS = true

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar hasManagerRelationships={HAS_MANAGER_RELATIONSHIPS} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
