import React from 'react';

export function KeyRemovalConfirmationModal({ isOpen, onConfirm, onCancel, isLoading, name }) {
  if (!isOpen) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" />
      <div className="modal-card">
        <section className="modal-card-body">
          <p>{`Remove ${name}?`}</p>
        </section>
        <footer className="modal-card-foot">
          <div className="buttons">
            <button
              type="button"
              className={`button is-danger ${isLoading ? 'is-loading' : ''}`}
              onClick={onConfirm}
            >
              Confirm
            </button>
            <button type="button" className="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
