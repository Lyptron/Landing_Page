'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, X, Search, Briefcase } from 'lucide-react'
import { assignTeamMember, removeTeamFromProject } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { useProject } from '@/lib/AdminProjectContext'

function generateTempId() {
  return 'temp-' + Date.now()
}

export default function ProjectTeamPage() {
  const { projectId, teamAssigned, setTeamAssigned, allTeamMembers, loadProject } = useProject()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [roleUpdateError, setRoleUpdateError] = useState<string | null>(null)

  const assignedIds = teamAssigned.map(t => t.id)
  const unassignedMembers = allTeamMembers.filter(m => !assignedIds.includes(m.id))
  
  const filteredUnassigned = unassignedMembers.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleAssign(memberId: string) {
    const member = allTeamMembers.find(m => m.id === memberId)
    if (!member) return

    // Optimistic Update
    const tempAssigned = { 
      ...member, 
      assignment_id: generateTempId(), 
      role_on_project: member.role 
    }
    setTeamAssigned(prev => [...prev, tempAssigned])
    setDropdownOpen(false)
    setSearchQuery('')

    const { data, error } = await assignTeamMember(projectId, memberId, member.role)
    if (error) {
      // Revert on error
      setTeamAssigned(prev => prev.filter(t => t.id !== memberId))
      alert('Failed to assign team member: ' + error.message)
    } else if (data) {
      // Sync real database key
      setTeamAssigned(prev => prev.map(t => t.id === memberId ? { ...t, assignment_id: data.id } : t))
      await loadProject()
    }
  }

  async function handleRemove(memberId: string) {
    const member = teamAssigned.find(t => t.id === memberId)
    if (!member) return

    // Optimistic Update
    setTeamAssigned(prev => prev.filter(t => t.id !== memberId))

    const { error } = await removeTeamFromProject(projectId, memberId)
    if (error) {
      // Revert on error
      setTeamAssigned(prev => [...prev, member])
      alert('Failed to remove team member: ' + error.message)
    } else {
      await loadProject()
    }
  }

  async function handleUpdateRole(memberId: string, newRole: string) {
    const snapshot = teamAssigned
    setTeamAssigned(prev => prev.map(t => t.id === memberId ? { ...t, role_on_project: newRole } : t))
    setUpdatingId(memberId)

    const { error } = await supabase
      .from('project_team')
      .update({ role_on_project: newRole })
      .eq('project_id', projectId)
      .eq('team_member_id', memberId)

    if (error) {
      // Roll back the optimistic update so the UI reflects the real DB state.
      setTeamAssigned(snapshot)
      setRoleUpdateError("Couldn't update role. Try again.")
      setTimeout(() => setRoleUpdateError(null), 3000)
    }
    setUpdatingId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Add button header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-(--cp-text)">Project Command & Team</h3>
          <p className="text-[11px] text-(--cp-text-faint) mt-0.5">{teamAssigned.length} experts assigned</p>
          {roleUpdateError && (
            <p className="text-[11px] text-(--cp-red) mt-1" role="alert">{roleUpdateError}</p>
          )}
        </div>
        
        {/* Dropdown Container */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="cp-btn-primary flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" /> Assign Member
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
              <div 
                className="absolute right-0 mt-2 w-72 rounded-xl p-3 z-40 border border-white/5 shadow-2xl flex flex-col gap-2.5"
                style={{ background: 'var(--cp-bg-elevated)' }}
              >
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-(--cp-border) bg-white/1.5">
                  <Search className="w-3.5 h-3.5 text-(--cp-text-faint)" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-[12.5px] w-full text-(--cp-text)"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto flex flex-col gap-1 custom-scrollbar">
                  {filteredUnassigned.length === 0 ? (
                    <p className="text-[11px] text-(--cp-text-faint) text-center py-4">No available team members</p>
                  ) : (
                    filteredUnassigned.map(m => (
                      <button
                        key={m.id}
                        onClick={() => handleAssign(m.id)}
                        className="flex items-center gap-2.5 w-full text-left p-2 rounded-lg hover:bg-white/2.5 hover:text-(--cp-text) transition-all cursor-pointer text-(--cp-text-muted)"
                      >
                        <div 
                          className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-mono text-[9px] font-bold text-white"
                          style={{ backgroundColor: m.accent_color || '#818CF8' }}
                        >
                          {m.initials}
                        </div>
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="text-[12px] font-semibold truncate">{m.name}</p>
                          <p className="text-[10px] text-(--cp-text-faint) truncate mt-0.5">{m.role}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid of Team Cards */}
      {teamAssigned.length === 0 ? (
        <div className="cp-card py-16 flex flex-col items-center justify-center text-center">
          <Briefcase className="w-8 h-8 text-(--cp-text-faint) mb-3" />
          <h4 className="text-[14px] font-semibold text-(--cp-text-secondary) mb-1">No Team Members Assigned</h4>
          <p className="text-[12px] text-(--cp-text-muted) max-w-xs leading-relaxed">
            Assign specialists to collaborate on deliverables and manage task flows.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamAssigned.map(m => {
            const accentColor = m.accent_color || '#818CF8'
            return (
              <div 
                key={m.id} 
                className="cp-card p-4.5 flex flex-col gap-4 relative group transition-all duration-300 hover:border-(--cp-cyan-border) hover:bg-white/1.5"
              >
                {/* Remove button (visible on hover) */}
                <button
                  onClick={() => handleRemove(m.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-(--cp-text-faint) hover:text-(--cp-red) hover:bg-(--cp-red-soft) transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                  title="Remove from project"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Avatar and Info Header */}
                <div className="flex items-start gap-3">
                  <div 
                    className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center relative select-none"
                    style={{ 
                      backgroundColor: m.image_url ? 'transparent' : accentColor,
                      boxShadow: `0 0 16px ${accentColor}18`,
                      border: `1px solid ${accentColor}25`
                    }}
                  >
                    {m.image_url ? (
                      <Image src={m.image_url} alt={m.name || ''} fill className="object-cover rounded-full" sizes="44px" />
                    ) : (
                      <span className="font-mono text-[14px] font-bold text-white">{m.initials}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pr-6 leading-tight">
                    <h4 className="text-[14px] font-bold text-(--cp-text) truncate">{m.name}</h4>
                    <p className="text-[11px] text-(--cp-text-faint) mt-1 truncate">{m.role}</p>
                  </div>
                </div>

                {/* Inline Project Role */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-(--cp-text-faint)">Project Role</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={m.role_on_project || ''}
                      onChange={e => handleUpdateRole(m.id, e.target.value)}
                      placeholder="e.g. Lead Frontend"
                      className="w-full bg-white/1.5 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-(--cp-text) outline-none focus:border-(--cp-cyan-border) transition-colors pr-8 font-medium"
                    />
                    {updatingId === m.id && (
                      <div className="absolute right-2.5 w-3.5 h-3.5 border border-(--cp-border) border-t-(--cp-cyan) rounded-full animate-spin" />
                    )}
                  </div>
                </div>

                {/* Expertise tags from member details */}
                {m.expertise && m.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 border-t border-(--cp-border-soft) pt-3">
                    {m.expertise.slice(0, 3).map((exp: string) => (
                      <span 
                        key={exp} 
                        className="text-[9.5px] px-2 py-0.5 rounded bg-white/2 border border-white/4 text-(--cp-text-muted) font-medium"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
