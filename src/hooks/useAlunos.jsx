import { useState, useEffect } from 'react';
import { getStudents, addStudent, deleteStudent, editStudent, getClasses } from '../services/api';
import { useDialog } from '../contexts/DialogContext';

export function useAlunos() {
    const { toast, confirm } = useDialog();

    const [alunos, setAlunos] = useState([]);
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [novoAluno, setNovoAluno] = useState({
        matricula: '', nome: '', email: '', turmaId: '', status: 'Ativo'
    });

    const [editingAluno, setEditingAluno] = useState(null);
    const [editData, setEditData] = useState({
        matricula: '', nome: '', turmaId: '', email: '', status: 'Ativo'
    });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        carregarAlunos();
        getClasses().then(setTurmas);
    }, []);

    async function carregarAlunos() {
        setLoading(true);
        const dados = await getStudents();
        setAlunos(dados);
        setLoading(false);
    }

    async function handleAddStudent(e) {
        e.preventDefault();
        try {
            await addStudent(novoAluno);
            toast('Aluno cadastrado com sucesso!', 'success');
            setNovoAluno({ matricula: '', nome: '', email: '', turma: '', status: 'Ativo' });
            carregarAlunos();
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    async function handleDelete(aluno) {
        const ok = await confirm(`Remover o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`);
        if (!ok) return;
        await deleteStudent(aluno.id);
        setAlunos(prev => prev.filter(a => a.id !== aluno.id));
        toast('Aluno removido.', 'success');
    }

    function openEdit(aluno) {
        setEditingAluno(aluno);
        setEditData({
            matricula: aluno.matricula,
            nome: aluno.nome || '',
            email: aluno.email || '',
            turmaId: aluno.turmaId || '',
            status: aluno.status || 'Ativo'
        });
    }

    async function handleSaveEdit(e) {
        e.preventDefault();
        setSavingEdit(true);
        try {
            await editStudent(editingAluno.id, editData);
            toast('Aluno atualizado com sucesso!', 'success');
            setEditingAluno(null);
            carregarAlunos();
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setSavingEdit(false);
        }
    }

    const alunosFiltrados = alunos.filter(aluno =>
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.matricula.includes(searchTerm)
    );

    return {
        alunosFiltrados,
        turmas,
        loading,
        searchTerm,
        setSearchTerm,
        novoAluno,
        setNovoAluno,
        handleAddStudent,
        handleDelete,
        editingAluno,
        setEditingAluno,
        editData,
        setEditData,
        savingEdit,
        openEdit,
        handleSaveEdit,
    };
}