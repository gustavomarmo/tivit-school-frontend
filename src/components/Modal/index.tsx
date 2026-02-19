import styles from './Modal.module.css'

export function Modal({ isOpen, title, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}