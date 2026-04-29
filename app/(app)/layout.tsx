import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

// In Phase 1 this is hardcoded. Phase 7 will read from the user's accepted manager_relationships.
const HAS_MANAGER_RELATIONSHIPS = false

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
