import { useState, useEffect } from 'react';
import { getCalendarEvents } from '../../services/api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CalendarDay } from '../../components/CalendarDay';
import styles from './Calendario.module.css';

export function Calendario() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getCalendarEvents();
            setEvents(data);
            setLoading(false);
        }
        load();
    }, []);

    function prevMonth() {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }

    function nextMonth() {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }

    function goToToday() {
        setCurrentDate(new Date());
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const prevLastDay = new Date(year, month, 0).getDate();

    const daysArray = [];

    for (let i = firstDayIndex; i > 0; i--) {
        daysArray.push({ day: prevLastDay - i + 1, type: 'prev' });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push({ day: i, type: 'current' });
    }

    const remaining = 42 - daysArray.length;
    for (let i = 1; i <= remaining; i++) {
        daysArray.push({ day: i, type: 'next' });
    }

    function formatDateKey(day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    const today = new Date();
    function isToday(day) {
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    }

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className={styles.container}>
            
            <Card>
                <div className={styles.header}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button onClick={prevMonth} variant="icon"><i className="fa-solid fa-chevron-left"></i></Button>
                        <Button onClick={goToToday} variant="secondary">Hoje</Button>
                        <Button onClick={nextMonth} variant="icon"><i className="fa-solid fa-chevron-right"></i></Button>
                    </div>
                    
                    <h2 className={styles.monthTitle}>{monthNames[month]} {year}</h2>

                    <Button onClick={() => alert('Em breve!')}>
                        <i className="fa-solid fa-plus"></i> Novo Evento
                    </Button>
                </div>
            </Card>

            <div className={styles.calendarGrid}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className={styles.weekDay}>{d}</div>
                ))}

                {daysArray.map((item, index) => {
                    const dateKey = item.type === 'current' ? formatDateKey(item.day) : null;
                    const dayEvents = dateKey ? events[dateKey] : [];
                    const isDayToday = item.type === 'current' && isToday(item.day);

                    return (
                        <CalendarDay 
                            key={index}
                            day={item.day}
                            type={item.type}
                            isToday={isDayToday}
                            events={dayEvents}
                            onClick={() => item.type === 'current' && alert(`Clicou no dia ${item.day}`)}
                        />
                    );
                })}
            </div>
        </div>
    );
}