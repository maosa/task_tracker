'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'manager_people'
const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonCard {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isFavorite: boolean
  isArchived: boolean
  adminUserId: string
}

type SortMode = 'name' | 'role' | 'favorites'
type Tab = 'home' | 'archive'

// ─── Seed data ────────────────────────────────────────────────────────────────

function seedPeople(): PersonCard[] {
  return [
    {
      id: 'seed-1',
      firstName: 'Alex',
      lastName: 'Chen',
      email: 'alex.chen@accessinfinity.com',
      role: 'Product Manager',
      isFavorite: true,
      isArchived: false,
      adminUserId: ADMIN_USER_ID || 'demo-user',
    },
    {
      id: 'seed-2',
      firstName: 'Sam',
      lastName: 'Williams',
      email: 'sam.williams@accessinfinity.com',
      role: 'Senior Engineer',
      isFavorite: false,
      isArchived: false,
      adminUserId: 'demo-user-2',
    },
    {
      id: 'seed-3',
      firstName: 'Jordan',
      lastName: 'Taylor',
      email: 'jordan.taylor@accessinfinity.com',
      role: 'UX Designer',
      isFavorite: false,
      isArchived: true,
      adminUserId: 'demo-user-3',
    },
  ]
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5l1.854 3.755L14 6.09l-3 2.922.708 4.13L8 11.135l-3.708 2.007L5 8.01 2 6.09l4.146-.835L8 1.5z"
        stroke={filled ? '#FFD300' : 'currentColor'}
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill={filled ? '#FFD300' : 'none'}
      />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M9 1.5l2.5 2.5L4 11.5H1.5V9L9 1.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Person modal (Add / Edit) ────────────────────────────────────────────────

interface PersonModalProps {
  initial: Partial<PersonCard>
  onSave: (data: Omit<PersonCard, 'id' | 'isFavorite' | 'isArchived'>) => void
  onDelete?: () => void
  onCancel: () => void
  mode: 'add' | 'edit'
}

function PersonModal({ initial, onSave, onDelete, onCancel, mode }: PersonModalProps) {
  const [firstName, setFirstName] = useState(initial.firstName || '')
  const [lastName, setLastName] = useState(initial.lastName || '')
  const [email, setEmail] = useState(initial.email || '')
  const [role, setRole] = useState(initial.role || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role: role.trim(),
      adminUserId: initial.adminUserId || ADMIN_USER_ID || 'demo-user',
    })
  }

  const inputClass =
    'w-full px-3 py-2 text-[13px] border border-[#DADADA] rounded-[6px] focus:outline-none focus:border-[#38308F] bg-white text-[#19153F] placeholder:text-[#797979]'
  const labelClass = 'block text-[12px] font-medium text-[#595959] mb-1'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white rounded-[12px] shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-[15px] font-medium text-[#19153F] mb-5">
          {mode === 'add' ? 'Add person' : 'Edit person'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
                className={inputClass}
                placeholder="First name"
              />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={inputClass}
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
              placeholder="e.g. Product Manager"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            {mode === 'edit' && onDelete && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 text-[13px] font-medium text-[#FF0522] border border-[#DADADA] rounded-[6px] hover:border-[#FF0522] bg-white transition-colors"
              >
                Archive
              </button>
            )}
            {confirmDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3 py-2 text-[13px] font-medium bg-[#FF0522] text-white rounded-[6px] hover:bg-[#cc0015] transition-colors"
              >
                Confirm archive
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-[13px] font-medium border border-[#DADADA] rounded-[6px] text-[#595959] hover:border-[#aaa] hover:text-[#19153F] bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!firstName.trim() || !lastName.trim()}
              className="px-4 py-2 text-[13px] font-medium bg-[#19153F] text-white rounded-[6px] border border-transparent hover:bg-[#2a2460] disabled:opacity-40 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Person card ──────────────────────────────────────────────────────────────

interface PersonCardProps {
  person: PersonCard
  onToggleFavorite: (id: string) => void
  onEdit: (person: PersonCard) => void
  onClick: (person: PersonCard) => void
}

function PersonCardItem({ person, onToggleFavorite, onEdit, onClick }: PersonCardProps) {
  const initials =
    (person.firstName[0] || '') + (person.lastName[0] || '')

  return (
    <div
      className="relative bg-white rounded-[10px] border border-[#DADADA] p-5 cursor-pointer hover:border-[#38308F] hover:shadow-sm transition-all group"
      onClick={() => onClick(person)}
    >
      {/* Favorite star */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(person.id) }}
        className={`absolute top-3 left-3 p-1 rounded transition-colors ${
          person.isFavorite ? 'text-[#FFD300]' : 'text-[#DADADA] hover:text-[#aaa]'
        }`}
        title={person.isFavorite ? 'Unpin' : 'Pin to top'}
      >
        <StarIcon filled={person.isFavorite} />
      </button>

      {/* Edit icon */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(person) }}
        className="absolute top-3 right-3 p-1 rounded text-[#DADADA] hover:text-[#595959] hover:bg-[#F2F2F2] opacity-0 group-hover:opacity-100 transition-all"
        title="Edit"
      >
        <PencilIcon />
      </button>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="w-14 h-14 rounded-full bg-[#B4AFE4] flex items-center justify-center text-[#19153F] text-[18px] font-medium select-none">
          {initials.toUpperCase()}
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium text-[#19153F]">
            {person.firstName} {person.lastName}
          </p>
          {person.role && (
            <p className="text-[12px] text-[#797979] mt-0.5">{person.role}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function ManagerLandingView() {
  const router = useRouter()
  const [people, setPeople] = useState<PersonCard[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('favorites')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editCard, setEditCard] = useState<PersonCard | null>(null)

  // Load from localStorage, seed if empty
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setPeople(JSON.parse(raw))
      } catch {
        setPeople(seedPeople())
      }
    } else {
      const seeded = seedPeople()
      setPeople(seeded)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    }
    setMounted(true)
  }, [])

  const save = (next: PersonCard[]) => {
    setPeople(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const handleToggleFavorite = (id: string) => {
    save(people.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)))
  }

  const handleAdd = (data: Omit<PersonCard, 'id' | 'isFavorite' | 'isArchived'>) => {
    const card: PersonCard = {
      ...data,
      id: Math.random().toString(36).slice(2),
      isFavorite: false,
      isArchived: false,
    }
    save([...people, card])
    setAddModalOpen(false)
  }

  const handleEditSave = (data: Omit<PersonCard, 'id' | 'isFavorite' | 'isArchived'>) => {
    if (!editCard) return
    save(people.map((p) => (p.id === editCard.id ? { ...p, ...data } : p)))
    setEditCard(null)
  }

  const handleArchive = () => {
    if (!editCard) return
    save(people.map((p) => (p.id === editCard.id ? { ...p, isArchived: true, isFavorite: false } : p)))
    setEditCard(null)
  }

  const handleCardClick = (person: PersonCard) => {
    router.push(`/manager/${person.adminUserId}`)
  }

  // Filter and sort
  const q = searchQuery.toLowerCase()
  const filtered = people
    .filter((p) => p.isArchived === (activeTab === 'archive'))
    .filter((p) =>
      !q ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    )
    .sort((a, b) => {
      if (sortMode === 'favorites') {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      }
      if (sortMode === 'role') return a.role.localeCompare(b.role)
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    })

  const chipBase = 'px-2.5 py-1 text-[12px] font-medium rounded-[4px] border transition-colors'
  const chipActive = 'bg-[#19153F] text-white border-[#19153F]'
  const chipInactive = 'bg-white text-[#595959] border-[#DADADA] hover:border-[#aaa] hover:text-[#19153F]'

  if (!mounted) return null

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      {/* Header */}
      <div className="bg-white border-b border-[#DADADA] px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-[16px] font-medium text-[#19153F]">Manager view</h1>
            <p className="text-[12px] text-[#797979] mt-0.5">Task lists of your direct reports</p>
          </div>

          {/* Search */}
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-[#797979] pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people…"
              className="pl-7 pr-3 py-1.5 text-[13px] border border-[#DADADA] rounded-[6px] w-48 placeholder:text-[#797979] focus:outline-none focus:border-[#38308F] bg-white"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#797979]">Sort:</span>
            {([
              ['favorites', 'Favourites first'],
              ['name', 'Name A–Z'],
              ['role', 'By role'],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`${chipBase} ${sortMode === mode ? chipActive : chipInactive}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Add person */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#19153F] text-white hover:bg-[#2a2460] transition-colors"
            title="Add person"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-4 border-b border-[#DADADA] -mb-[1px]">
          {(['home', 'archive'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[13px] font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#19153F] text-[#19153F]'
                  : 'border-transparent text-[#797979] hover:text-[#595959]'
              }`}
            >
              {tab === 'home' ? 'Home' : 'Archive'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#797979]">
            <PersonIcon />
            <p className="text-[13px]">
              {activeTab === 'archive'
                ? 'No archived people.'
                : searchQuery
                ? 'No results for your search.'
                : 'No direct reports added yet. Click + to add someone.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {filtered.map((person) => (
              <PersonCardItem
                key={person.id}
                person={person}
                onToggleFavorite={handleToggleFavorite}
                onEdit={setEditCard}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {addModalOpen && (
        <PersonModal
          initial={{}}
          mode="add"
          onSave={handleAdd}
          onCancel={() => setAddModalOpen(false)}
        />
      )}

      {/* Edit modal */}
      {editCard && (
        <PersonModal
          initial={editCard}
          mode="edit"
          onSave={handleEditSave}
          onDelete={handleArchive}
          onCancel={() => setEditCard(null)}
        />
      )}
    </div>
  )
}
