import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { useAuth } from '../contexts/AuthContext'
import { GET_USER_STATS, GET_USERS } from '../graphql/operations'

const DEPT_ICONS = {
  engineering: 'fa-code', design: 'fa-paint-brush',
  marketing: 'fa-bullhorn', sales: 'fa-handshake', hr: 'fa-users',
}
const DEPT_COLORS = {
  engineering: '#a78bfa', design: '#f472b6',
  marketing: '#fbbf24', sales: '#34d399', hr: '#60a5fa',
}

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(t) }, [])

  const { data: statsData, loading: statsLoading } = useQuery(GET_USER_STATS, { skip: !isAdmin, pollInterval: 30000 })
  const { data: usersData } = useQuery(GET_USERS, { skip: !isAdmin })

  const stats = statsData?.userStats
  const recentUsers = usersData?.users?.slice(0, 5) || []

  const greeting = time.getHours() < 12 ? 'Good morning' : time.getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: 1200, margin: '0 auto', animation: 'fadeInUp 0.6s ease' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.02))',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-2xl)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: 300, height: 300, background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%' }}></div>
        
        <div style={{ zIndex: 1 }}>
          <p style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{greeting},</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px 0', background: 'linear-gradient(to right, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user?.name}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 24 }}>Welcome back to your {isAdmin ? 'admin' : ''} command center.</p>
          
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
              <i className="fas fa-calendar-alt" style={{ color: 'var(--primary-light)' }}></i> {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
              <i className="fas fa-clock" style={{ color: 'var(--accent)' }}></i> {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--primary)', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: 'white', fontWeight: 600, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
              <i className="fas fa-shield-alt"></i> {user?.role.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: 'white', boxShadow: '0 8px 24px rgba(124,58,237,0.4)', zIndex: 1, border: '4px solid var(--bg-primary)' }}>
          {initials}
        </div>
      </div>

      {isAdmin ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
            {[
              { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: 'fa-users', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
              { label: 'Online Now', value: stats?.onlineUsers ?? 0, icon: 'fa-circle', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Messages Sent', value: stats?.totalMessages ?? 0, icon: 'fa-comments', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              { label: 'Network Departments', value: stats?.departmentBreakdown?.length ?? 0, icon: 'fa-building', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer' }} onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'}} onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'}}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{statsLoading ? '…' : stat.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-xl)' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.1)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-chart-bar"></i></div>
                Department Distribution
              </h3>
              {(stats?.departmentBreakdown || []).map(d => (
                <div key={d.department} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontWeight: 500 }}>
                      <i className={`fas ${DEPT_ICONS[d.department] || 'fa-building'}`} style={{ color: DEPT_COLORS[d.department] || 'var(--primary-light)', width: 16, textAlign: 'center' }}></i>
                      <span style={{ textTransform: 'capitalize' }}>{d.department}</span>
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{d.count} Users</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${((d.count / (stats?.totalUsers || 1)) * 100)}%`, background: DEPT_COLORS[d.department] || 'var(--primary)', borderRadius: 4, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-user-plus"></i></div>
                Network Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentUsers.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No recent users.</p> : recentUsers.map((u) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', border: '2px solid var(--bg-primary)' }}>
                      {(u.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                    </div>
                    {u.isOnline && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></span>}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12, background: u.role === 'admin' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)', color: u.role === 'admin' ? 'var(--primary-light)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-xl)' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.1)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-id-badge"></i></div>
              Identity Snapshot
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Full Name', value: user?.name, icon: 'fa-user' },
                { label: 'Work Email', value: user?.email, icon: 'fa-envelope' },
                { label: 'Department', value: user?.department || 'Unassigned', icon: 'fa-building' },
                { label: 'Access Level', value: user?.role, icon: 'fa-layer-group' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-shield-check"></i></div>
              System Integrity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['End-to-End Encryption Enabled', 'JWT Authorization Active', 'Profile Configured', 'Secure Connection'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-check" style={{ fontSize: 10 }}></i>
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{s}</span>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 24, padding: 16, background: 'rgba(124,58,237,0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="fas fa-info-circle" style={{ color: 'var(--primary-light)', fontSize: 20 }}></i>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Your workspace is fully secured. Navigate to the Messages tab to start collaborating entirely in real-time.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
