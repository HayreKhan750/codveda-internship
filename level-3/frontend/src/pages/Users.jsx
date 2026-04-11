import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useAuth } from '../contexts/AuthContext'
import { GET_USERS, UPDATE_USER_ROLE, DEACTIVATE_USER } from '../graphql/operations'
import ConfirmModal from '../components/ConfirmModal'

const Users = () => {
  const { isAdmin } = useAuth()
  const { data, loading, error, refetch } = useQuery(GET_USERS, { skip: !isAdmin, fetchPolicy: 'cache-and-network' })
  const [updateRole] = useMutation(UPDATE_USER_ROLE)
  const [deactivate] = useMutation(DEACTIVATE_USER)
  
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'danger', user: null })
  const [actionError, setActionError] = useState(null)

  if (!isAdmin) {
    return (
      <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)' }}>
          <i className="fas fa-shield-xmark" style={{ fontSize: 36, color: '#ef4444' }}></i>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>You need strict administrator privileges to view and manage the system's user directory.</p>
      </div>
    )
  }

  const users = data?.users || []
  
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchesDept = department ? (u.department || 'unassigned') === department : true
    return matchesSearch && matchesDept
  })

  const getInitials = (name) => name.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('')

  const getDepartmentConfig = (dept) => {
    const cfgs = { 
      engineering: { icon: 'fa-code', color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' },
      design: { icon: 'fa-paint-brush', color: '#f472b6', bg: 'rgba(236,72,153,0.15)' },
      marketing: { icon: 'fa-bullhorn', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
      sales: { icon: 'fa-handshake', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
      hr: { icon: 'fa-users', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' }
    }
    return cfgs[dept] || { icon: 'fa-building', color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)' }
  }

  const handleAction = async () => {
    const { type, user } = confirmModal
    setConfirmModal({ isOpen: false, type: 'danger', user: null })
    setActionError(null)
    
    try {
      if (type === 'danger') { // deactivate
        await deactivate({ variables: { userId: user.id } })
      } else if (type === 'primary') { // promote
        await updateRole({ variables: { userId: user.id, role: 'admin' } })
      } else if (type === 'warning') { // demote
        await updateRole({ variables: { userId: user.id, role: 'user' } })
      }
      refetch()
    } catch (err) {
      console.error(err)
      setActionError(err.message || 'Failed to perform action')
    }
  }

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: 1200, margin: '0 auto', animation: 'fadeInUp 0.6s ease' }}>
      
      {/* Action Error Alert */}
      {actionError && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: 12, 
          padding: '16px 20px', 
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#ef4444'
        }}>
          <i className="fas fa-circle-exclamation" style={{ fontSize: 20 }}></i>
          <span style={{ fontWeight: 500 }}>{actionError}</span>
          <button 
            onClick={() => setActionError(null)}
            style={{ 
              marginLeft: 'auto', 
              background: 'none', 
              border: 'none', 
              color: '#ef4444', 
              cursor: 'pointer',
              fontSize: 18
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Premium Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
              <i className="fas fa-users-gear" style={{ fontSize: 18 }}></i>
            </div>
            Directory Management
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>Showing {filteredUsers.length} of {users.length} total active workforce members.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, background: 'var(--bg-secondary)', padding: 12, borderRadius: 16, border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px 10px 38px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}
            />
          </div>

          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 32px 0 14px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '10px auto', fontFamily: 'inherit' }}
          >
            <option value="">Global Network</option>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="hr">Human Resources</option>
          </select>

          <button 
            onClick={() => refetch()}
            style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          >
            <i className="fas fa-sync-alt" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}></i>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 40, height: 40 }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Synchronizing directory...</p>
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 16, padding: '24px', textAlign: 'center', color: '#ef4444' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: 32, marginBottom: 12 }}></i>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>System Error</h3>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>{error.message || 'Failed to fetch users via GraphQL.'}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid var(--glass-border)' }}>
            <i className="fas fa-users-slash" style={{ fontSize: 32, opacity: 0.5 }}></i>
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: 'var(--text-primary)' }}>No Personnel Found</h3>
          <p style={{ margin: 0, fontSize: 14 }}>Try adjusting your search criteria or department filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filteredUsers.map((u) => {
            const deptCfg = getDepartmentConfig(u.department || 'unassigned');
            return (
              <div key={u.id} style={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--glass-border)', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.2), 0 0 0 1px var(--primary-light)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--glass-border)' }}
              >
                {/* Glow bar */}
                <div style={{ height: 4, width: '100%', background: `linear-gradient(90deg, ${deptCfg.color}, transparent)` }}></div>
                
                <div style={{ padding: 24 }}>
                  {/* Header info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-primary))', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }}>
                          {getInitials(u.name)}
                        </div>
                        {u.isOnline && <span style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: '#10b981', borderRadius: '50%', border: '3px solid var(--bg-secondary)' }}></span>}
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                    {/* Badge */}
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                      background: u.role === 'admin' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)', 
                      color: u.role === 'admin' ? 'var(--primary-light)' : 'var(--text-secondary)',
                      boxShadow: u.role === 'admin' ? 'inset 0 0 0 1px rgba(124,58,237,0.3)' : 'none'
                    }}>{u.role}</span>
                  </div>

                  {/* Body Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: deptCfg.bg, color: deptCfg.color, borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                      <i className={`fas ${deptCfg.icon}`}></i>
                      <span style={{ textTransform: 'capitalize' }}>{u.department || 'Unassigned'}</span>
                    </div>
                    {u.age && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid var(--glass-border)' }}>
                        <i className="fas fa-cake-candles" style={{ color: 'var(--text-muted)' }}></i>
                        {u.age}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid var(--glass-border)' }}>
                      <i className="fas fa-calendar-check" style={{ color: 'var(--text-muted)' }}></i>
                      {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'var(--glass-border)', marginBottom: 16 }}></div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    {u.role === 'admin' ? (
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, type: 'warning', user: u })}
                        style={{ flex: 1, padding: '10px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#f59e0b' }}
                      >
                        <i className="fas fa-user-minus"></i> Demote
                      </button>
                    ) : (
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, type: 'primary', user: u })}
                        style={{ flex: 1, padding: '10px', background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = '#a78bfa' }}
                      >
                        <i className="fas fa-shield-halved"></i> Promote
                      </button>
                    )}
                    
                    <button 
                      onClick={() => setConfirmModal({ isOpen: true, type: 'danger', user: u })}
                      style={{ flex: 1, padding: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444' }}
                    >
                      <i className="fas fa-ban"></i> Deactivate
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Premium Confirm Modal via Component */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        title={confirmModal.type === 'danger' ? 'Deactivate Personnel' : confirmModal.type === 'primary' ? 'Promote to Administrator' : 'Demote to Standard User'}
        confirmText={confirmModal.type === 'danger' ? 'Deactivate' : 'Update Access'}
        message={
          confirmModal.type === 'danger' 
            ? `Are you strictly sure you want to deactivate ${confirmModal.user?.name}? They will immediately lose access to the Codveda network until an administrator restores their account.`
            : `Are you sure you want to alter the security clearance of ${confirmModal.user?.name}?`
        }
        onConfirm={handleAction}
        onCancel={() => setConfirmModal({ isOpen: false, type: 'danger', user: null })}
      />
    </div>
  )
}

export default Users
