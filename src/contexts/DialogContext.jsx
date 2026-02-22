import { createContext, useContext, useState, useCallback, useRef } from 'react';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);
    const toastId = useRef(0);

    const toast = useCallback((message, type = 'info') => {
        const id = ++toastId.current;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const confirm = useCallback((message) => {
        return new Promise((resolve) => {
            setConfirmState({ message, resolve });
        });
    }, []);

    function handleConfirm(result) {
        confirmState?.resolve(result);
        setConfirmState(null);
    }

    return (
        <DialogContext.Provider value={{ toast, confirm }}>
            {children}

            {/* Toast container */}
            <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

            {/* Confirm modal */}
            {confirmState && (
                <ConfirmModal
                    message={confirmState.message}
                    onConfirm={() => handleConfirm(true)}
                    onCancel={() => handleConfirm(false)}
                />
            )}
        </DialogContext.Provider>
    );
}

export function useDialog() {
    const ctx = useContext(DialogContext);
    if (!ctx) throw new Error('useDialog deve ser usado dentro de DialogProvider');
    return ctx;
}

const TYPE_CONFIG = {
    success: { icon: 'fa-circle-check',      color: '#27ae60', bg: 'rgba(39,174,96,0.12)'   },
    error:   { icon: 'fa-circle-xmark',       color: '#c0392b', bg: 'rgba(192,57,43,0.12)'  },
    warning: { icon: 'fa-triangle-exclamation', color: '#f39c12', bg: 'rgba(243,156,18,0.12)' },
    info:    { icon: 'fa-circle-info',         color: '#2980b9', bg: 'rgba(41,128,185,0.12)' },
};

function ToastContainer({ toasts, onDismiss }) {
    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 9999,
        }}>
            {toasts.map(t => (
                <Toast key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onDismiss }) {
    const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-primary)',
                border: `1px solid ${cfg.color}`,
                borderLeft: `4px solid ${cfg.color}`,
                borderRadius: '8px',
                padding: '12px 16px',
                minWidth: '280px',
                maxWidth: '380px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                animation: 'toastIn 0.25s ease',
            }}
        >
            <i
                className={`fa-solid ${cfg.icon}`}
                style={{ color: cfg.color, fontSize: '1.1rem', flexShrink: 0 }}
            />
            <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {toast.message}
            </span>
            <button
                onClick={onDismiss}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--icon-inactive)', fontSize: '0.85rem', padding: '2px', flexShrink: 0,
                }}
            >
                <i className="fa-solid fa-xmark" />
            </button>

            <style>{`
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9998,
                animation: 'fadeIn 0.2s ease',
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    padding: '28px 32px',
                    maxWidth: '420px',
                    width: '90%',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    animation: 'slideDown 0.2s ease',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <i
                        className="fa-solid fa-triangle-exclamation"
                        style={{ color: '#f39c12', fontSize: '1.4rem', marginTop: '2px', flexShrink: 0 }}
                    />
                    <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {message}
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '8px 20px', borderRadius: '6px', border: '1px solid var(--border-color)',
                            background: 'transparent', cursor: 'pointer', fontSize: '0.9rem',
                            color: 'var(--text-primary)', fontWeight: 'bold',
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '8px 20px', borderRadius: '6px', border: 'none',
                            background: '#c0392b', color: 'white', cursor: 'pointer',
                            fontSize: '0.9rem', fontWeight: 'bold',
                        }}
                    >
                        Confirmar
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideDown {
                    from { transform: translateY(-16px); opacity: 0; }
                    to   { transform: translateY(0);     opacity: 1; }
                }
            `}</style>
        </div>
    );
}