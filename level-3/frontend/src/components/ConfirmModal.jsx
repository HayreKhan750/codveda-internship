import React from 'react';

const TYPE_CONFIG = {
  danger:  { icon: 'fa-triangle-exclamation', color: '#ef4444', glow: 'rgba(239,68,68,0.2)',  confirmBg: '#ef4444', confirmShadow: 'rgba(239,68,68,0.35)' },
  warning: { icon: 'fa-circle-exclamation',   color: '#f59e0b', glow: 'rgba(245,158,11,0.2)', confirmBg: '#f59e0b', confirmShadow: 'rgba(245,158,11,0.35)' },
  primary: { icon: 'fa-shield-check',         color: '#7c3aed', glow: 'rgba(124,58,237,0.2)', confirmBg: '#7c3aed', confirmShadow: 'rgba(124,58,237,0.35)' },
};

const ConfirmModal = ({
  isOpen, title, message,
  onConfirm, onCancel,
  confirmText = 'Confirm',
  type = 'danger'   // 'danger' | 'warning' | 'primary'
}) => {
  if (!isOpen) return null;

  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.danger;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        width: '100%', maxWidth: 420,
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
        overflow: 'hidden',
        animation: 'fadeInUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />

        {/* Header */}
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: cfg.glow,
            border: `1px solid ${cfg.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: `0 4px 20px ${cfg.glow}`
          }}>
            <i className={`fas ${cfg.icon}`} style={{ fontSize: 28, color: cfg.color }} />
          </div>

          <h3 style={{
            margin: 0, fontSize: 20, fontWeight: 700,
            color: '#f1f5f9', letterSpacing: '-0.3px'
          }}>{title}</h3>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 24px 24px' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.65 }}>{message}</p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 24px' }} />

        {/* Actions */}
        <div style={{
          padding: 20, display: 'flex',
          justifyContent: 'flex-end', gap: 12
        }}>
          <button onClick={onCancel} style={{
            padding: '10px 20px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#94a3b8', borderRadius: 10,
            cursor: 'pointer', fontSize: 14, fontWeight: 600,
            transition: 'all 0.2s ease', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.target.style.background='rgba(255,255,255,0.1)'; e.target.style.color='#f1f5f9' }}
          onMouseLeave={e => { e.target.style.background='rgba(255,255,255,0.05)'; e.target.style.color='#94a3b8' }}>
            Cancel
          </button>

          <button onClick={onConfirm} style={{
            padding: '10px 22px', border: 'none',
            background: cfg.confirmBg,
            color: 'white', borderRadius: 10,
            cursor: 'pointer', fontSize: 14, fontWeight: 700,
            transition: 'all 0.2s ease',
            boxShadow: `0 4px 14px ${cfg.confirmShadow}`,
            fontFamily: 'inherit', letterSpacing: '0.2px',
          }}
          onMouseEnter={e => { e.target.style.transform='translateY(-1px)'; e.target.style.boxShadow=`0 6px 20px ${cfg.confirmShadow}` }}
          onMouseLeave={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow=`0 4px 14px ${cfg.confirmShadow}` }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
