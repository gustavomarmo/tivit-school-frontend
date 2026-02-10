import styles from './Form.module.css';

export function Select({ label, id, children, ...rest }) {
    return (
        <div className={styles.group}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            <select id={id} className={styles.control} {...rest}>
                {children}
            </select>
        </div>
    );
}