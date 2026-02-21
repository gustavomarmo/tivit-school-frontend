import styles from './IconButton.module.css';

export function IconButton({ icon, title, variant = 'default', size = 'md', className = '', ...rest }) {
    return (
        <button
            className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
            title={title}
            aria-label={title}
            {...rest}
        >
            <i className={`fa-solid ${icon}`}></i>
        </button>
    );
}