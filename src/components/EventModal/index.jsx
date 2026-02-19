import { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Input } from '../Form/Input';
import styles from './EventModal.module.css';

export function EventModal({ isOpen, onClose, onSave, onDelete, selectedDate, selectedEvent }) {

    const [title, setTitle] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    // Ao abrir o modal, detecta se é edição ou criação
    useEffect(() => {
        if (isOpen) {
            if (selectedEvent) {
                setTitle(selectedEvent);
                setIsEditing(true);
            } else {
                setTitle('');
                setIsEditing(false);
            }
            setConfirmingDelete(false);
        }
    }, [isOpen, selectedEvent]);

    if (!isOpen) return null;

    function formatDateDisplay(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim()) return;
        onSave(title.trim());
    }

    function handleDelete() {
        if (!confirmingDelete) {
            setConfirmingDelete(true);
            return;
        }
        onDelete();
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {isEditing ? 'Editar Evento' : 'Novo Evento'}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <p className={styles.dateLabel}>
                    <i className="fa-solid fa-calendar-day"></i>
                    {formatDateDisplay(selectedDate)}
                </p>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Título do Evento"
                        placeholder="Ex: Prova de Matemática"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        autoFocus
                        required
                    />

                    <div className={styles.actions}>
                        {isEditing && (
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleDelete}
                                className={confirmingDelete ? styles.confirmDelete : ''}
                            >
                                <i className="fa-solid fa-trash"></i>
                                {confirmingDelete ? 'Confirmar exclusão?' : 'Remover'}
                            </Button>
                        )}

                        <div className={styles.rightActions}>
                            <Button type="button" variant="icon" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                <i className={`fa-solid ${isEditing ? 'fa-pen' : 'fa-check'}`}></i>
                                {isEditing ? 'Salvar alteração' : 'Criar evento'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}