import type { Product, TaskStatus } from './supabase/types'

export interface MockTask {
  id: string
  product: Product
  project_id: string
  project_name: string
  description: string
  week_start_date: string
  status: TaskStatus
  is_flagged: boolean
  sort_order: number
}

// Apr 20 = week 15, Apr 27 = week 16, May 4 = week 17, May 11 = week 18
export const MOCK_TASKS: MockTask[] = [
  // Previous week — Apr 20
  {
    id: 'task-1',
    product: 'AH',
    project_id: 'proj-1',
    project_name: 'OnTrack',
    description: 'Kick-off meeting with design team',
    week_start_date: '2026-04-20',
    status: 'complete',
    is_flagged: false,
    sort_order: 0,
  },
  {
    id: 'task-2',
    product: 'NURO',
    project_id: 'proj-2',
    project_name: 'Platform',
    description: 'Investigate performance regression in CI pipeline',
    week_start_date: '2026-04-20',
    status: 'complete',
    is_flagged: false,
    sort_order: 1,
  },
  {
    id: 'task-3',
    product: 'EH',
    project_id: 'proj-3',
    project_name: 'Evidence Hub',
    description: 'Draft user research interview questions',
    week_start_date: '2026-04-20',
    status: 'open',
    is_flagged: true,
    sort_order: 2,
  },
  // Current week — Apr 27
  {
    id: 'task-4',
    product: 'AH',
    project_id: 'proj-1',
    project_name: 'OnTrack',
    description: 'Finalise onboarding flow wireframes',
    week_start_date: '2026-04-27',
    status: 'complete',
    is_flagged: false,
    sort_order: 0,
  },
  {
    id: 'task-5',
    product: 'NURO',
    project_id: 'proj-2',
    project_name: 'Platform',
    description: 'Review API rate limiting spec with engineering',
    week_start_date: '2026-04-27',
    status: 'open',
    is_flagged: true,
    sort_order: 1,
  },
  {
    id: 'task-6',
    product: 'EH',
    project_id: 'proj-3',
    project_name: 'Evidence Hub',
    description: 'Write acceptance criteria for search feature',
    week_start_date: '2026-04-27',
    status: 'open',
    is_flagged: false,
    sort_order: 2,
  },
  {
    id: 'task-7',
    product: 'AH',
    project_id: 'proj-4',
    project_name: 'Client Portal',
    description: 'Stakeholder update — Q2 progress summary',
    week_start_date: '2026-04-27',
    status: 'open',
    is_flagged: false,
    sort_order: 3,
  },
  // Next week — May 4
  {
    id: 'task-8',
    product: 'AH',
    project_id: 'proj-4',
    project_name: 'Client Portal',
    description: 'Prepare sprint review presentation',
    week_start_date: '2026-05-04',
    status: 'open',
    is_flagged: false,
    sort_order: 0,
  },
  {
    id: 'task-9',
    product: 'NURO',
    project_id: 'proj-2',
    project_name: 'Platform',
    description: 'Coordinate infrastructure migration plan',
    week_start_date: '2026-05-04',
    status: 'open',
    is_flagged: false,
    sort_order: 1,
  },
  {
    id: 'task-10',
    product: 'EH',
    project_id: 'proj-3',
    project_name: 'Evidence Hub',
    description: 'Usability testing session with 3 participants',
    week_start_date: '2026-05-04',
    status: 'open',
    is_flagged: false,
    sort_order: 2,
  },
  // Week after next — May 11
  {
    id: 'task-11',
    product: 'AH',
    project_id: 'proj-1',
    project_name: 'OnTrack',
    description: 'Present updated roadmap to leadership',
    week_start_date: '2026-05-11',
    status: 'open',
    is_flagged: false,
    sort_order: 0,
  },
]
