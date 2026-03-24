import { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/api';
import { NOTIFICACAO_ICON } from '../../constants';
import styles from './NotificationBell.module.css';

export function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function loadNotifications() {
        const [notifs, count] = await Promise.all([
            getNotifications(),
            getUnreadCount()
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
    }

    async function handleMarkAsRead(id) {
        await markNotificationAsRead(id);
        loadNotifications();
    }

    async function handleMarkAllAsRead() {
        await markAllNotificationsAsRead();
        loadNotifications();
    }

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <button className={styles.bellBtn} onClick={() => setIsOpen(prev => !prev)}>
                <i className="fa-solid fa-bell"></i>
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span>Notificações</span>
                        <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
                            Marcar todas como lidas
                        </button>
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <i className="fa-solid fa-bell-slash"></i>
                                <p>Nenhuma notificação</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`${styles.item} ${!notif.read ? styles.unread : ''}`}
                                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                                >
                                    <div className={`${styles.icon} ${styles[notif.type]}`}>
                                        <i className={`fa-solid ${NOTIFICACAO_ICON[notif.type] ?? 'fa-bell'}`}></i>
                                    </div>
                                    <div className={styles.content}>
                                        <p className={styles.title}>{notif.title}</p>
                                        <p className={styles.message}>{notif.message}</p>
                                        <p className={styles.time}>{notif.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}