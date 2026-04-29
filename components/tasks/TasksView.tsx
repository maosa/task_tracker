'use client'

import { useState } from 'react'
import ProductBadge from './ProductBadge'
import { MOCK_TASKS, type MockTask } from '@/lib/mock-data'
import {
  getCurrentWeekIndex,
  weekIndexToDateString,
  formatWeekHeader,
  dateStringToWeekIndex,
} from '@/lib/weeks'

type ViewMode = 'focused' | 'expanded'

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  centerWeekIndex: number
  currentWeekIndex: number
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

function Toolbar({
  viewMode,
  onViewModeChange,
  centerWeekIndex,
  currentWeekIndex,
  onPrev,
  onNext,
  onToday,
}: ToolbarProps) {
  const isAtCurrentWeek = centerWeekIndex === currentWeekIndex

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-[#DADADA] flex-shrink-0">
      {/* Add task */}
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#19153F] text-white text-[13px] font-medium rounded-[6px] border border-transparent hover:bg-[#2a2460] transition-colors"
        disabled
        title="Add task (Phase 3)"
      >
        <PlusIcon />
        Add task
      </button>

      <div className="flex-1" />

      {/* Week navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={centerWeekIndex === 0}
          className="flex items-center justify-center w-7 h-7 rounded border border-[#DADADA] text-[#595959] hover:border-[#aaa] hover:text-[#19153F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
          aria-label="Previous week"
        >
          <ChevronLeftIcon />
        </button>

        <button
          onClick={onToday}
          className={`px-2.5 py-1 text-[12px] font-medium rounded border transition-colors ${
            isAtCurrentWeek
              ? 'border-[#00D1BA] text-[#00D1BA] bg-white cursor-default'
              : 'border-[#DADADA] text-[#595959] bg-white hover:border-[#00D1BA] hover:text-[#00D1BA]'
          }`}
        >
          Today
        </button>

        <button
          onClick={onNext}
          className="flex items-center justify-center w-7 h-7 rounded border border-[#DADADA] text-[#595959] hover:border-[#aaa] hover:text-[#19153F] transition-colors bg-white"
          aria-label="Next week"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* View toggle */}
      <div className="flex rounded border border-[#DADADA] overflow-hidden bg-white">
        {(['focused', 'expanded'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`px-3 py-1 text-[12px] font-medium capitalize transition-colors ${
              viewMode === mode
                ? 'bg-[#19153F] text-white'
                : 'text-[#595959] hover:bg-[#F2F2F2]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex items-center">
        <span className="absolute left-2.5 text-[#797979] pointer-events-none">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search tasks…"
          className="pl-7 pr-3 py-1.5 text-[13px] border border-[#DADADA] rounded-[6px] w-48 placeholder:text-[#797979] focus:outline-none focus:border-[#38308F] bg-white"
          disabled
          title="Search (Phase 4)"
        />
      </div>
    </div>
  )
}

// ─── Task row cells ────────────────────────────────────────────────────────────

function rowStyle(task: MockTask): React.CSSProperties {
  if (task.status === 'complete') return { backgroundColor: '#C3FFF8' }
  if (task.is_flagged) return { backgroundColor: '#FFCDD3' }
  return { backgroundColor: '#FFFFFF' }
}

function descriptionStyle(task: MockTask): string {
  if (task.status === 'complete') return 'line-through text-[#797979]'
  if (task.is_flagged) return 'text-[#CC0015]'
  return 'text-[#19153F]'
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface TaskTableProps {
  tasks: MockTask[]
  visibleWeekIndices: number[]
  currentWeekIndex: number
  viewMode: ViewMode
}

function TaskTable({ tasks, visibleWeekIndices, currentWeekIndex, viewMode }: TaskTableProps) {
  // Filter and sort tasks: only those in visible weeks, sorted by week then sort_order
  const visibleWeekStrings = new Set(visibleWeekIndices.map(weekIndexToDateString))

  const visibleTasks = tasks
    .filter((t) => visibleWeekStrings.has(t.week_start_date))
    .sort((a, b) => {
      const wA = dateStringToWeekIndex(a.week_start_date)
      const wB = dateStringToWeekIndex(b.week_start_date)
      if (wA !== wB) return wA - wB
      return a.sort_order - b.sort_order
    })

  const hasTasks = visibleTasks.length > 0

  return (
    <div className="overflow-x-auto flex-1">
      <table
        className="border-collapse"
        style={{ minWidth: '100%', tableLayout: 'fixed' }}
      >
        <colgroup>
          <col style={{ width: 110, minWidth: 110 }} />
          <col style={{ width: 130, minWidth: 130 }} />
          {visibleWeekIndices.map((wi) => (
            <col key={wi} style={{ minWidth: 200 }} />
          ))}
        </colgroup>

        {/* Header */}
        <thead>
          <tr>
            {/* Product header — sticky */}
            <th
              className="sticky left-0 z-20 bg-[#F2F2F2] border-b border-r border-[#DADADA] px-3 py-2 text-left text-[11px] font-medium text-[#797979] uppercase tracking-wide"
              style={{ boxShadow: 'none' }}
            >
              Product
            </th>

            {/* Project header — sticky */}
            <th
              className="sticky z-20 bg-[#F2F2F2] border-b border-r border-[#DADADA] px-3 py-2 text-left text-[11px] font-medium text-[#797979] uppercase tracking-wide"
              style={{ left: 110, boxShadow: '2px 0 4px -1px rgba(0,0,0,0.08)' }}
            >
              Project
            </th>

            {/* Week headers */}
            {visibleWeekIndices.map((wi) => {
              const isCurrent = wi === currentWeekIndex
              return (
                <th
                  key={wi}
                  className="border-b border-r border-[#DADADA] px-3 py-2 text-left text-[13px] font-medium text-[#19153F] bg-[#F2F2F2]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={isCurrent ? 'pb-0.5 border-b-2 border-[#00D1BA]' : ''}
                    >
                      {formatWeekHeader(wi)}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#00D1BA] text-[#19153F] leading-none">
                        current
                      </span>
                    )}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {!hasTasks && (
            <tr>
              <td
                colSpan={2 + visibleWeekIndices.length}
                className="px-4 py-8 text-center text-[13px] text-[#797979]"
              >
                No tasks for this period.
              </td>
            </tr>
          )}

          {visibleTasks.map((task) => {
            const taskWeekIndex = dateStringToWeekIndex(task.week_start_date)
            const bg = rowStyle(task)
            const descClass = descriptionStyle(task)

            return (
              <tr key={task.id} style={bg} className="group">
                {/* Product — sticky */}
                <td
                  className="sticky left-0 z-10 border-b border-r border-[#DADADA] px-3 py-2.5"
                  style={{ ...bg }}
                >
                  <ProductBadge product={task.product} />
                </td>

                {/* Project — sticky */}
                <td
                  className="sticky z-10 border-b border-r border-[#DADADA] px-3 py-2.5 text-[13px] text-[#595959] whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ left: 110, ...bg, boxShadow: '2px 0 4px -1px rgba(0,0,0,0.08)' }}
                >
                  {task.project_name}
                </td>

                {/* Week cells */}
                {visibleWeekIndices.map((wi) => {
                  const isTaskWeek = wi === taskWeekIndex
                  return (
                    <td
                      key={wi}
                      className="border-b border-r border-[#DADADA] px-3 py-2.5 text-[13px]"
                      style={isTaskWeek ? bg : { backgroundColor: '#FFFFFF' }}
                    >
                      {isTaskWeek && (
                        <span className={descClass}>{task.description}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}

          {/* "Add task" footer row placeholder (Phase 3) */}
          <tr>
            <td
              className="sticky left-0 z-10 bg-white border-r border-[#DADADA]"
              style={{ boxShadow: 'none' }}
            />
            <td
              className="sticky z-10 bg-white border-r border-[#DADADA]"
              style={{ left: 110, boxShadow: '2px 0 4px -1px rgba(0,0,0,0.08)' }}
            />
            {visibleWeekIndices.map((wi) => (
              <td
                key={wi}
                className="border-r border-[#DADADA] px-3 py-2"
              >
                <span className="text-[12px] text-[#797979] opacity-0 group-hover:opacity-100">
                  + Add task
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function TasksView() {
  const todayWeekIndex = getCurrentWeekIndex()
  const [viewMode, setViewMode] = useState<ViewMode>('focused')
  const [centerWeekIndex, setCenterWeekIndex] = useState(todayWeekIndex)

  const visibleWeekIndices =
    viewMode === 'focused'
      ? [centerWeekIndex]
      : [centerWeekIndex - 1, centerWeekIndex, centerWeekIndex + 1].filter((w) => w >= 0)

  return (
    <div className="flex flex-col h-full">
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        centerWeekIndex={centerWeekIndex}
        currentWeekIndex={todayWeekIndex}
        onPrev={() => setCenterWeekIndex((w) => Math.max(0, w - 1))}
        onNext={() => setCenterWeekIndex((w) => w + 1)}
        onToday={() => setCenterWeekIndex(todayWeekIndex)}
      />
      <TaskTable
        tasks={MOCK_TASKS}
        visibleWeekIndices={visibleWeekIndices}
        currentWeekIndex={todayWeekIndex}
        viewMode={viewMode}
      />
    </div>
  )
}
