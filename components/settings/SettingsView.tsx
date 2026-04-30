'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { DefaultLanding, ProjectRow } from '@/lib/supabase/types'
import { Pencil, Trash2, Check, X } from 'lucide-react'

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  role: string | null
  default_landing: DefaultLanding
}

interface ManagerRelRow {
  id: string
  manager_email: string
  manager_user_id: string | null
  status: string
  invited_at: string
  accepted_at: string | null
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: string; message: string; type: 'success' | 'error' }

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-[13px] font-medium shadow-lg border ${
            t.type === 'error'
              ? 'bg-white border-[#FF0522] text-[#CC0015]'
              : 'bg-[#19153F] border-transparent text-white'
          }`}
        >
          {t.message}
          <button onClick={() => onDismiss(t.id)} className="ml-1 opacity-60 hover:opacity-100 text-[11px] font-bold">✕</button>
        </div>
      ))}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  dangerous?: boolean
}

function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Confirm', dangerous = false }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-[12px] shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-[13px] text-[#19153F] leading-relaxed">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-[6px] text-[13px] font-medium border border-[#DADADA] text-[#595959] bg-white hover:border-[#AAAAAA]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-[6px] text-[13px] font-medium border border-transparent text-white ${
              dangerous ? 'bg-[#CC0015] hover:bg-[#AA0010]' : 'bg-[#19153F] hover:bg-[#2e2870]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[8px] border border-[#DADADA] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#DADADA]">
        <h2 className="text-[13px] font-medium text-[#19153F]">{title}</h2>
      </div>
      <div className="px-5 py-5">
        {children}
      </div>
    </div>
  )
}

// ─── Account Section ──────────────────────────────────────────────────────────

function AccountSection({ onToast }: { onToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [user, setUser] = useState<UserRow | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [defaultLanding, setDefaultLanding] = useState<DefaultLanding>('task_list')
  const [hasManagerRole, setHasManagerRole] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!ADMIN_USER_ID) return

      const [{ data: userData }, { data: relData }] = await Promise.all([
        supabase.from('users').select('*').eq('id', ADMIN_USER_ID).single(),
        supabase.from('manager_relationships').select('id').eq('manager_user_id', ADMIN_USER_ID).eq('status', 'accepted').limit(1),
      ])

      if (userData) {
        setUser(userData)
        setFirstName(userData.first_name ?? '')
        setLastName(userData.last_name ?? '')
        setEmail(userData.email ?? '')
        setRole(userData.role ?? '')
        setDefaultLanding(userData.default_landing ?? 'task_list')
      }
      setHasManagerRole(Array.isArray(relData) && relData.length > 0)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!ADMIN_USER_ID) return
    setSaving(true)
    const { error } = await supabase.from('users').upsert({
      id: ADMIN_USER_ID,
      first_name: firstName || null,
      last_name: lastName || null,
      email: email,
      role: role || null,
      default_landing: defaultLanding,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    setSaving(false)
    if (error) {
      onToast('Failed to save account details.', 'error')
    } else {
      onToast('Account details saved.')
    }
  }

  if (loading) {
    return <p className="text-[13px] text-[#797979]">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-[#595959]">First name</span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="px-3 py-2 rounded-[6px] border border-[#DADADA] text-[13px] text-[#19153F] outline-none focus:border-[#19153F]"
            placeholder="First name"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-[#595959]">Last name</span>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="px-3 py-2 rounded-[6px] border border-[#DADADA] text-[13px] text-[#19153F] outline-none focus:border-[#19153F]"
            placeholder="Last name"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-[#595959]">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 rounded-[6px] border border-[#DADADA] text-[13px] text-[#19153F] outline-none focus:border-[#19153F]"
          placeholder="you@example.com"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-[#595959]">Current role</span>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 rounded-[6px] border border-[#DADADA] text-[13px] text-[#19153F] outline-none focus:border-[#19153F]"
          placeholder="e.g. Product Manager"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-medium text-[#595959]">Default landing page</span>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="default_landing"
            value="task_list"
            checked={defaultLanding === 'task_list'}
            onChange={() => setDefaultLanding('task_list')}
            className="accent-[#19153F]"
          />
          <span className="text-[13px] text-[#19153F]">My task list</span>
        </label>
        <div className="flex flex-col gap-1">
          <label className={`flex items-center gap-2.5 ${!hasManagerRole ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
              type="radio"
              name="default_landing"
              value="manager_view"
              checked={defaultLanding === 'manager_view'}
              onChange={() => hasManagerRole && setDefaultLanding('manager_view')}
              disabled={!hasManagerRole}
              className="accent-[#19153F]"
            />
            <span className="text-[13px] text-[#19153F]">Manager view</span>
          </label>
          {!hasManagerRole && (
            <p className="text-[12px] text-[#797979] ml-6">
              Manager view is available once you have an accepted manager relationship. Ask a colleague to invite you as their manager.
            </p>
          )}
        </div>
      </div>

      <div className="pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-[6px] text-[13px] font-medium bg-[#19153F] text-white border border-transparent hover:bg-[#2e2870] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

// ─── Projects Section ─────────────────────────────────────────────────────────

function ProjectsSection({ onToast }: { onToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null)
  const [deleteTaskCount, setDeleteTaskCount] = useState(0)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  async function loadProjects() {
    if (!ADMIN_USER_ID) { setLoading(false); return }
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('admin_user_id', ADMIN_USER_ID)
      .is('deleted_at', null)
      .order('name', { ascending: true })
    setProjects((data as ProjectRow[]) ?? [])
    setLoading(false)
  }

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    if (projects.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setAddError('A project with this name already exists.')
      return
    }
    setAdding(true)
    setAddError('')
    const { data, error } = await supabase
      .from('projects')
      .insert({ admin_user_id: ADMIN_USER_ID!, name, created_at: new Date().toISOString() })
      .select()
      .single()
    setAdding(false)
    if (error || !data) {
      onToast('Failed to add project.', 'error')
    } else {
      setProjects((prev) => [...prev, data as ProjectRow].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      onToast('Project added.')
    }
  }

  const handleEditSave = async (id: string) => {
    const name = editName.trim()
    if (!name) { setEditingId(null); return }
    if (projects.some((p) => p.id !== id && p.name.toLowerCase() === name.toLowerCase())) {
      onToast('A project with this name already exists.', 'error')
      return
    }
    const { error } = await supabase
      .from('projects')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      onToast('Failed to save project.', 'error')
    } else {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name } : p)).sort((a, b) => a.name.localeCompare(b.name))
      )
      onToast('Project saved.')
    }
    setEditingId(null)
  }

  const initiateDelete = async (project: ProjectRow) => {
    const { count } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', project.id)
    setDeleteTaskCount(count ?? 0)
    setDeleteTarget(project)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deleteTarget.id)
    if (error) {
      onToast('Failed to delete project.', 'error')
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      onToast('Project deleted.')
    }
    setDeleteTarget(null)
  }

  return (
    <>
      {deleteTarget && (
        <ConfirmDialog
          message={
            deleteTaskCount > 0
              ? `${deleteTaskCount} task${deleteTaskCount === 1 ? '' : 's'} reference this project. Deleting it will remove the project association from those tasks. This action cannot be undone.`
              : 'Are you sure you want to delete this project? This action cannot be undone.'
          }
          confirmLabel="Delete"
          dangerous
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-[13px] text-[#797979]">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="text-[13px] text-[#797979]">No projects yet. Add one below.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#F2F2F2]">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-2 py-2.5 group">
                {editingId === project.id ? (
                  <>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(project.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-[6px] border border-[#19153F] text-[13px] text-[#19153F] outline-none"
                    />
                    <button
                      onClick={() => handleEditSave(project.id)}
                      className="p-1.5 rounded-[4px] text-[#19153F] hover:bg-[#F2F2F2]"
                      title="Save"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-[4px] text-[#797979] hover:bg-[#F2F2F2]"
                      title="Cancel"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-[13px] text-[#19153F]">{project.name}</span>
                    <button
                      onClick={() => { setEditingId(project.id); setEditName(project.name) }}
                      className="p-1.5 rounded-[4px] text-[#797979] opacity-0 group-hover:opacity-100 hover:bg-[#F2F2F2] hover:text-[#19153F]"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => initiateDelete(project)}
                      className="p-1.5 rounded-[4px] text-[#797979] opacity-0 group-hover:opacity-100 hover:bg-[#FFCDD3] hover:text-[#CC0015]"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1 pt-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setAddError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
              placeholder="New project name"
              className="flex-1 px-3 py-2 rounded-[6px] border border-[#DADADA] text-[13px] text-[#19153F] outline-none focus:border-[#19153F] placeholder:text-[#797979]"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="px-4 py-2 rounded-[6px] text-[13px] font-medium bg-[#19153F] text-white border border-transparent hover:bg-[#2e2870] disabled:opacity-50"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </div>
          {addError && <p className="text-[12px] text-[#CC0015]">{addError}</p>}
        </div>
      </div>
    </>
  )
}

// ─── Manager Section ──────────────────────────────────────────────────────────

type ValidationState = 'idle' | 'found' | 'not_found'

function ManagerSection({ onToast }: { onToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [validation, setValidation] = useState<ValidationState>('idle')
  const [sending, setSending] = useState(false)
  const [managers, setManagers] = useState<ManagerRelRow[]>([])
  const [loadingManagers, setLoadingManagers] = useState(true)
  const [removeTarget, setRemoveTarget] = useState<ManagerRelRow | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadManagers()
  }, [])

  async function loadManagers() {
    if (!ADMIN_USER_ID) { setLoadingManagers(false); return }
    const { data } = await supabase
      .from('manager_relationships')
      .select('*')
      .eq('admin_user_id', ADMIN_USER_ID)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false })
    setManagers((data as ManagerRelRow[]) ?? [])
    setLoadingManagers(false)
  }

  const validateEmail = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidation('idle')
      return
    }
    const { data } = await supabase.from('users').select('id').eq('email', email).single()
    setValidation(data ? 'found' : 'not_found')
  }, [])

  const handleEmailChange = (val: string) => {
    setInviteEmail(val)
    setValidation('idle')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => validateEmail(val), 300)
  }

  const handleEmailBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    validateEmail(inviteEmail)
  }

  const handleSendInvitation = async () => {
    const email = inviteEmail.trim()
    if (!email || !ADMIN_USER_ID) return

    const existing = managers.find((m) => m.manager_email.toLowerCase() === email.toLowerCase())
    if (existing) {
      onToast('This person already has an active manager relationship.', 'error')
      return
    }

    setSending(true)

    // Look up manager's user_id by email (may be null if not registered)
    const { data: managerUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    const managerUserId = managerUser?.id ?? null

    const now = new Date().toISOString()
    const { error } = await supabase.from('manager_relationships').insert({
      admin_user_id: ADMIN_USER_ID,
      manager_email: email,
      manager_user_id: managerUserId,
      status: 'accepted',
      invited_at: now,
      accepted_at: now,
    })
    setSending(false)

    if (error) {
      onToast('Failed to add manager.', 'error')
    } else {
      onToast('Manager added.')
      setInviteEmail('')
      setValidation('idle')
      loadManagers()
    }
  }

  const confirmRemove = async () => {
    if (!removeTarget) return
    const { error } = await supabase
      .from('manager_relationships')
      .update({ status: 'archived' })
      .eq('id', removeTarget.id)
    if (error) {
      onToast('Failed to remove manager.', 'error')
    } else {
      setManagers((prev) => prev.filter((m) => m.id !== removeTarget.id))
      onToast('Manager removed.')
    }
    setRemoveTarget(null)
  }

  return (
    <>
      {removeTarget && (
        <ConfirmDialog
          message={`Remove ${removeTarget.manager_email} as a manager? They will no longer have access to your task list.`}
          confirmLabel="Remove"
          dangerous
          onConfirm={confirmRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-medium text-[#595959]">Add your manager</p>
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendInvitation() }}
                placeholder="manager@example.com"
                className="px-3 py-2 rounded-[6px] border border-[#DADADA] text-[13px] text-[#19153F] outline-none focus:border-[#19153F] placeholder:text-[#797979]"
              />
              {validation === 'found' && (
                <p className="text-[12px] text-[#1B8C7A]">✓ Registered user — relationship will be established immediately.</p>
              )}
              {validation === 'not_found' && (
                <p className="text-[12px] text-[#B38600]">User not found. You can still add this email — the relationship will activate once they register.</p>
              )}
            </div>
            <button
              onClick={handleSendInvitation}
              disabled={sending || !inviteEmail.trim()}
              className="self-start px-4 py-2 rounded-[6px] text-[13px] font-medium bg-[#19153F] text-white border border-transparent hover:bg-[#2e2870] disabled:opacity-50"
            >
              {sending ? 'Adding…' : 'Add manager'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-medium text-[#595959]">Current managers</p>
          {loadingManagers ? (
            <p className="text-[13px] text-[#797979]">Loading…</p>
          ) : managers.length === 0 ? (
            <p className="text-[13px] text-[#797979]">No managers yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[#F2F2F2]">
              {managers.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2.5 group">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] text-[#19153F]">{m.manager_email}</span>
                    {m.accepted_at && (
                      <span className="text-[11px] text-[#797979]">
                        Accepted {new Date(m.accepted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setRemoveTarget(m)}
                    className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#797979] border border-[#DADADA] bg-white hover:border-[#FF0522] hover:text-[#CC0015] opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SettingsView() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  if (!ADMIN_USER_ID) {
    return (
      <div className="p-8">
        <p className="text-[13px] text-[#797979]">
          Set <code className="bg-[#F2F2F2] px-1 rounded text-[12px]">NEXT_PUBLIC_ADMIN_USER_ID</code> in your environment to use Settings.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl flex flex-col gap-5">
      <h1 className="text-base font-medium text-[#19153F]">Settings</h1>
      <SectionCard title="Account details">
        <AccountSection onToast={addToast} />
      </SectionCard>
      <SectionCard title="Projects">
        <ProjectsSection onToast={addToast} />
      </SectionCard>
      <SectionCard title="Manager invitation">
        <ManagerSection onToast={addToast} />
      </SectionCard>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
