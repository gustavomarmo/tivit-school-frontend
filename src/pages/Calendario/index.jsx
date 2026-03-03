import { useState, useEffect } from 'react';
import { getCalendarEvents, saveCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from '../../services/api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CalendarDay } from '../../components/CalendarDay';
import { EventModal } from '../../components/EventModal';
import styles from './Calendario.module.css';

const MONTH_NAMES = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

const WEEK_DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export function Calendario() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    async function loadEvents() {
        const data = await getCalendarEvents(month + 1, year);
        setEvents(data);
        setLoading(false);
    }
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        loadEvents();
    }, [month, year]);

    function prevMonth() {
        setCurrentDate(new Date(year, month - 1, 1));
    }
    function nextMonth() {
        setCurrentDate(new Date(year, month + 1, 1));
    }
    function goToToday() {
        setCurrentDate(new Date());
    }

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
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    }

    function openCreateModal(dateKey) {
        setSelectedDate(dateKey);
        setSelectedEvent(null);
        setModalOpen(true);
    }

    function openEditModal(dateKey, eventObj) {
        setSelectedDate(dateKey);
        setSelectedEvent(eventObj);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setSelectedDate(null);
        setSelectedEvent(null);
    }

    async function handleSave(title) {
        if (selectedEvent) {
            await updateCalendarEvent(selectedDate, selectedEvent.id, title);
        } else {
            await saveCalendarEvent(selectedDate, title);
        }
        closeModal();
        loadEvents();
    }

    async function handleDelete() {
        await deleteCalendarEvent(selectedEvent.id);
        closeModal();
        loadEvents();
    }

    return (
        <div className={styles.container}>

            <Card>
                <div className={styles.header}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button onClick={prevMonth} variant="icon">
                            <i className="fa-solid fa-chevron-left"></i>
                        </Button>
                        <Button onClick={goToToday} variant="secondary">Hoje</Button>
                        <Button onClick={nextMonth} variant="icon">
                            <i className="fa-solid fa-chevron-right"></i>
                        </Button>
                    </div>

                    <h2 className={styles.monthTitle}>
                        {MONTH_NAMES[month]} {year}
                    </h2>

                    <Button onClick={() => {
                        const isCurrentMonth =
                            month === today.getMonth() && year === today.getFullYear();
                        const day = isCurrentMonth ? today.getDate() : 1;
                        openCreateModal(formatDateKey(day));
                    }}>
                        <i className="fa-solid fa-plus"></i> Novo Evento
                    </Button>
                </div>
            </Card>

            <div className={styles.calendarGrid}>
                {WEEK_DAYS.map(d => (
                    <div key={d} className={styles.weekDay}>{d}</div>
                ))}

                {loading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                        Carregando...
                    </div>
                ) : (
                    daysArray.map((item, index) => {
                        const dateKey = item.type === 'current' ? formatDateKey(item.day) : null;
                        const dayEvents = dateKey ? (events[dateKey] || []) : [];
                        const isDayToday = item.type === 'current' && isToday(item.day);

                        return (
                            <CalendarDay
                                key={index}
                                day={item.day}
                                type={item.type}
                                isToday={isDayToday}
                                events={dayEvents.map(e => e.title)}
                                onClick={() => item.type === 'current' && openCreateModal(dateKey)}
                                onEventClick={(eventTitle) => {const evt = dayEvents.find(e => e.title === eventTitle);
                                openEditModal(dateKey, evt);}}>   
                            </CalendarDay>
                        );
                    })
                )}
            </div>

            <EventModal
                isOpen={modalOpen}
                onClose={closeModal}
                onSave={handleSave}
                onDelete={handleDelete}
                selectedDate={selectedDate}
                selectedEvent={selectedEvent?.title ?? null}
            />
        </div>
    );
}