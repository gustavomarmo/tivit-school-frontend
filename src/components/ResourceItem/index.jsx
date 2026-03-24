import { Button } from '../Button';
import { MATERIAL_ICON } from '../../constants';
import styles from './ResourceItem.module.css';

export function ResourceItem({ type, title, desc, status, onOpen }) {
    return (
        <div className={styles.item}>
            <div className={styles.info}>
                <i className={`fa-solid ${MATERIAL_ICON[type] ?? 'fa-file'} ${styles.icon}`}></i>
                <div className={styles.details}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.desc}>{desc}</span>
                </div>
            </div>

            <div className={styles.actions}>
                {status && (
                    <span className={`${styles.status} ${styles[status.toLowerCase()]}`}>
                        {status}
                    </span>
                )}
                <Button variant="icon" onClick={onOpen} title="Visualizar">
                    <i className="fa-solid fa-eye"></i>
                </Button>
            </div>
        </div>
    );
}