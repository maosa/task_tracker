'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'sidebar_expanded'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

function TaskListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="8" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="12" width="8" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="15" y="3.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M15.5 5l0.8 0.8 1.2-1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 15.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 15.5c0-2.485 1.567-4.605 3.8-5.26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M3.757 3.757l1.06 1.06M15.183 15.183l1.06 1.06M3.757 16.243l1.06-1.06M15.183 4.817l1.06-1.06"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface SidebarProps {
  hasManagerRelationships: boolean
}

export default function Sidebar({ hasManagerRelationships }: SidebarProps) {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) setExpanded(stored === 'true')
    setMounted(true)
  }, [])

  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  const mainNavItems: NavItem[] = [
    { href: '/tasks', label: 'My tasks', icon: <TaskListIcon /> },
    ...(hasManagerRelationships
      ? [{ href: '/manager', label: 'Manager view', icon: <PeopleIcon /> }]
      : []),
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  // Prevent layout shift by rendering collapsed state until localStorage is read
  const isExpanded = mounted ? expanded : false

  return (
    <aside
      className="flex flex-col h-full bg-[#19153F] text-white flex-shrink-0 transition-[width] duration-200"
      style={{ width: isExpanded ? '220px' : '52px' }}
    >
      {/* Toggle button */}
      <div className="flex items-center justify-end px-2 pt-3 pb-2">
        <button
          onClick={toggle}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors"
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </div>

      {/* Logo / app name */}
      <div className="flex items-center gap-3 px-3 pb-4">
        <div className="w-7 h-7 rounded bg-[#00D1BA] flex-shrink-0 flex items-center justify-center text-[#19153F] font-semibold text-xs select-none">
          TT
        </div>
        {isExpanded && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            Task Tracker
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2">
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} expanded={isExpanded} active={isActive(item.href)} />
        ))}
      </nav>

      {/* Settings — pinned to bottom */}
      <div className="px-2 pb-4">
        <NavLink
          item={{ href: '/settings', label: 'Settings', icon: <SettingsIcon /> }}
          expanded={isExpanded}
          active={isActive('/settings')}
        />
      </div>
    </aside>
  )
}

function NavLink({
  item,
  expanded,
  active,
}: {
  item: NavItem
  expanded: boolean
  active: boolean
}) {
  return (
    <Link
      href={item.href}
      title={!expanded ? item.label : undefined}
      className={`
        flex items-center gap-3 rounded px-2 py-2 text-sm transition-colors
        ${active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}
      `}
    >
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {item.icon}
      </span>
      {expanded && (
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
      )}
    </Link>
  )
}
