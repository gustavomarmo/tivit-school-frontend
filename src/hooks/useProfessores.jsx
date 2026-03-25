import { useState, useEffect } from 'react';
import { getTeachers, addTeacher, deleteTeacher, editTeacher } from '../services/api';
import { useDialog } from '../contexts/DialogContext';

export function useProfessores() {
    const { toast, confirm } = useDialog();

    const [professores, setProfessores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [novoProf, setNovoProf] = useState({
        matricula: '', nome: '', email: '', disciplina: '', status: 'Ativo'
    });

    const [editingProf, setEditingProf] = useState(null);
    const [editData, setEditData] = useState({
        matricula: '', nome: '', email: '', disciplina: '', status: 'Ativo'
    });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        carregarProfessores();
    }, []);

    async function carregarProfessores() {
        setLoading(true);
        const dados = await getTeachers();
        setProfessores(dados);
        setLoading(false);
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!novoProf.matricula || !novoProf.nome || !novoProf.disciplina) {
            toast('Preencha todos os campos obrigatórios.', 'warning');
            return;
        }
        try {
            await addTeacher(novoProf);
            toast('Professor cadastrado com sucesso!', 'success');
            setNovoProf({ matricula: '', nome: '', email: '', disciplina: '', status: 'Ativo' });
            carregarProfessores();
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    async function handleDelete(prof) {
        const ok = await confirm(`Remover o professor "${prof.nome}"? Esta ação não pode ser desfeita.`);
        if (!ok) return;
        await deleteTeacher(prof.id);
        setProfessores(prev => prev.filter(p => p.id !== prof.id));
        toast('Professor removido.', 'success');
    }

    function openEdit(prof) {
        setEditingProf(prof);
        setEditData({
            matricula: prof.matricula,
            nome: prof.nome || '',
            email: prof.email || '',
            disciplina: prof.disciplina || '',
            status: prof.status || 'Ativo'
        });
    }

    async function handleSaveEdit(e) {
        e.preventDefault();
        setSavingEdit(true);
        try {
            await editTeacher(editingProf.id, editData);
            toast('Professor atualizado com sucesso!', 'success');
            setEditingProf(null);
            carregarProfessores();
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setSavingEdit(false);
        }
    }

    const professoresFiltrados = professores.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.matricula.includes(searchTerm) ||
        p.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        professoresFiltrados,
        loading,
        searchTerm,
        setSearchTerm,
        novoProf,
        setNovoProf,
        handleAdd,
        handleDelete,
        editingProf,
        setEditingProf,
        editData,
        setEditData,
        savingEdit,
        openEdit,
        handleSaveEdit,
    };
}