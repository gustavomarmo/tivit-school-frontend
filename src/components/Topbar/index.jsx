import { useAuth } from '../../hooks/useAuth';
import styles from './Topbar.module.css';
import logo from '../../assets/images/Logo Edu Connect.png';
import userPhoto from '../../assets/images/IMG_8792.jpg';

export function Topbar({ onToggleSidebar }) {
    const { user, logout } = useAuth();

    return (
        <header className={styles.topbar}>
            <button className={styles.toggleBtn} onClick={onToggleSidebar}>
                <i className="fa-solid fa-bars"></i>
            </button>

            <div className={styles.logoContainer}>
                <img src={logo} alt="Edu Connect" />
            </div>

            <div className={styles.spacer}></div>

            <div className={styles.userProfile}>
                <img src={userPhoto} alt="User" className={styles.userPhoto} />
                <span className={styles.userName}>{user.name}</span>
            </div>

            <button className={styles.logoutBtn} onClick={logout}>
                <i className="fa-solid fa-right-from-bracket"></i>
            </button>
        </header>
    );
}