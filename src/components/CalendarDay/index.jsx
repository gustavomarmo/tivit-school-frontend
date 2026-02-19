import styles from './CalendarDay.module.css';

export function CalendarDay({ day, type = 'current', isToday = false, events = [], onClick }) {
    
    return (
        <div 
            className={`
                ${styles.container} 
                ${type !== 'current' ? styles.otherMonth : ''}
                ${isToday ? styles.today : ''}
            `}
            onClick={onClick}
        >
            <span className={styles.dayNumber}>{day}</span>
            
            <div className={styles.eventList}>
                {events.map((evt, idx) => (
                    <div key={idx} className={styles.eventItem} title={evt} onClick={e => {e.stopPropagation(); onEventClick?.(evt);}}>
                        {evt}
                    </div>
                ))}
            </div>
        </div>
    );
}