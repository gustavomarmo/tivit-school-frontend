import styles from './Button.module.css';

export function Button({ children, variant = 'primary', className = '', ...rest }) {
    return (
        <button 
            className={`${styles.btn} ${styles[variant]} ${className}`} 
            {...rest}
        >
            {children}
        </button>
    );
}