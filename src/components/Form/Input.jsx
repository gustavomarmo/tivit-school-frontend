import styles from './Form.module.css';

export function Input({ label, id, ...rest }) {
    return (
        <div className={styles.group}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            <input id={id} className={styles.control} {...rest} />
        </div>
    );
}