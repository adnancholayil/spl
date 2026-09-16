import React from 'react';
import { AlertTriangle, Info, CheckCircle2, Trash2, X, RotateCcw } from 'lucide-react';

/**
 * ConfirmModal Component
 * Replaces native browser alert() and confirm() popups with a broadcast-grade dark modal.
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation Required',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info' | 'success'
  isAlert = false // if true, only shows single OK/Close button
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.3)',
      icon: Trash2,
      btnClass: 'btn-danger'
    },
    warning: {
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      border: 'rgba(245,158,11,0.3)',
      icon: AlertTriangle,
      btnClass: 'btn-primary'
    },
    info: {
      color: '#06B6D4',
      bg: 'rgba(6,182,212,0.12)',
      border: 'rgba(6,182,212,0.3)',
      icon: Info,
      btnClass: 'btn-primary'
    },
    success: {
      color: '#10B981',
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.3)',
      icon: CheckCircle2,
      btnClass: 'btn-primary'
    }
  };

  const cfg = typeConfig[type] || typeConfig.danger;
  const IconComponent = cfg.icon;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--spl-panel)',
          border: `1px solid ${cfg.border}`,
          borderRadius: 12,
          padding: '28px 24px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
          position: 'relative'
        }}
      >
        {/* Close button top right */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4
          }}
        >
          <X size={18} />
        </button>

        {/* Icon Badge */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cfg.color
          }}
        >
          <IconComponent size={28} />
        </div>

        {/* Title & Message */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-broadcast)',
              fontSize: 20,
              color: '#fff',
              letterSpacing: '0.04em',
              marginBottom: 6,
              textTransform: 'uppercase'
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.5
            }}
          >
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%', paddingTop: 8 }}>
          {!isAlert && (
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 13,
                justifyContent: 'center'
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (typeof onConfirm === 'function') onConfirm();
              onClose();
            }}
            className={cfg.btnClass}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: 13,
              justifyContent: 'center',
              background: type === 'danger' ? '#dc2626' : undefined,
              borderColor: type === 'danger' ? '#ef4444' : undefined,
              color: '#fff'
            }}
          >
            {isAlert ? 'OK' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
