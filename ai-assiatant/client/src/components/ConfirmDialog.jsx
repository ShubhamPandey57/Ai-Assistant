import { useState } from 'react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog - inline modal that replaces window.confirm
 * Usage: const { confirm, ConfirmDialog } = useConfirm();
 *        await confirm({ title, message }) then call onConfirm
 */
export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, danger = true }) => {
  if (!isOpen) return null;
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className={`confirm-icon ${danger ? 'danger' : ''}`}>{danger ? '🗑' : '❓'}</div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} autoFocus>
            {danger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
