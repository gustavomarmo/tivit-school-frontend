import { useState, useEffect } from 'react';
import {
    getClasses, createTurma, deleteTurma,
    getVinculosDaTurma, getTeachers, getAllDisciplinas,
    vincularDisciplina, desvincularDisciplina,
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

export function useTurmas() {
    const { toast, confirm } = useDialog();

    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [novaTurma, setNovaTurma] = useState({
        nome: '', anoLetivo: new Date().getFullYear()
    });
    const [savingNova, setSavingNova] = useState(false);

    const [turmaVinculos, setTurmaVinculos] = useState(null);
    const [vinculos, setVinculos] = useState([]);
    const [loadingVinculos, setLoadingVinculos] = useState(false);

    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [novoVinculo, setNovoVinculo] = useState({ disciplinaId: '', professorId: '' });
    const [savingVinculo, setSavingVinculo] = useState(false);

    useEffect(() => {
        carregarTurmas();
        getTeachers().then(setProfessores);
        getAllDisciplinas().then(setDisciplinas);
    }, []);

    async function carregarTurmas() {
        setLoading(true);
        const dados = await getClasses();
        setTurmas(dados);
        setLoading(false);
    }

    async function handleCriarTurma(e) {
        e.preventDefault();
        if (!novaTurma.nome.trim()) return;
        setSavingNova(true);
        try {
            await createTurma(novaTurma);
            toast('Turma criada com sucesso!', 'success');
            setNovaTurma({ nome: '', anoLetivo: new Date().getFullYear() });
            carregarTurmas();
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setSavingNova(false);
        }
    }

    async function handleDeletarTurma(turma) {
        const ok = await confirm(`Remover a turma "${turma.nome}"? Todos os vínculos serão desfeitos.`);
        if (!ok) return;
        try {
            await deleteTurma(turma.id);
            setTurmas(prev => prev.filter(t => t.id !== turma.id));
            toast('Turma removida.', 'success');
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    async function abrirVinculos(turma) {
        setTurmaVinculos(turma);
        setLoadingVinculos(true);
        setVinculos([]);
        setNovoVinculo({ disciplinaId: '', professorId: '' });
        try {
            const dados = await getVinculosDaTurma(turma.id);
            setVinculos(dados);
        } catch {
            toast('Erro ao carregar vínculos.', 'error');
        } finally {
            setLoadingVinculos(false);
        }
    }

    async function handleVincular(e) {
        e.preventDefault();
        if (!novoVinculo.disciplinaId || !novoVinculo.professorId) {
            toast('Selecione a disciplina e o professor.', 'warning');
            return;
        }
        setSavingVinculo(true);
        try {
            await vincularDisciplina({
                turmaId: turmaVinculos.id,
                disciplinaId: Number(novoVinculo.disciplinaId),
                professorId: Number(novoVinculo.professorId),
            });
            toast('Vínculo criado!', 'success');
            setNovoVinculo({ disciplinaId: '', professorId: '' });
            const dados = await getVinculosDaTurma(turmaVinculos.id);
            setVinculos(dados);
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setSavingVinculo(false);
        }
    }

    async function handleDesvincular(vinculo) {
        const ok = await confirm(`Remover ${vinculo.disciplina} de ${turmaVinculos.nome}?`);
        if (!ok) return;
        try {
            await desvincularDisciplina(vinculo.id);
            setVinculos(prev => prev.filter(v => v.id !== vinculo.id));
            toast('Vínculo removido.', 'success');
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    const turmasFiltradas = turmas.filter(t =>
        t.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        turmasFiltradas,
        loading,
        searchTerm,
        setSearchTerm,
        novaTurma,
        setNovaTurma,
        savingNova,
        handleCriarTurma,
        handleDeletarTurma,
        turmaVinculos,
        setTurmaVinculos,
        vinculos,
        loadingVinculos,
        abrirVinculos,
        professores,
        disciplinas,
        novoVinculo,
        setNovoVinculo,
        savingVinculo,
        handleVincular,
        handleDesvincular,
    };
}