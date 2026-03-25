import { useState, useEffect } from 'react';
import { getSubjectsList, getStudents, realizarChamada } from '../services/api';
import { useDialog } from '../contexts/DialogContext';

export function useFrequencia() {
    const { toast } = useDialog();

    const [vinculos, setVinculos] = useState([]);
    const [disciplinasUnicas, setDisciplinasUnicas] = useState([]);
    const [turmasFiltradas, setTurmasFiltradas] = useState([]);

    const [filtro, setFiltro] = useState({ disciplinaId: '', turmaId: '', horario: '' });
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [listVisible, setListVisible] = useState(false);

    useEffect(() => {
        getSubjectsList().then(data => {
            setVinculos(data);
            const mapa = new Map();
            data.forEach(v => {
                if (!mapa.has(v.disciplinaId)) {
                    mapa.set(v.disciplinaId, { disciplinaId: v.disciplinaId, nome: v.nome });
                }
            });
            setDisciplinasUnicas(Array.from(mapa.values()));
        });
    }, []);

    function handleDisciplinaChange(e) {
        const disciplinaId = e.target.value;
        const turmas = vinculos
            .filter(v => String(v.disciplinaId) === disciplinaId)
            .map(v => ({ turmaId: v.turmaId, nome: v.turma }));
        setTurmasFiltradas(turmas);
        setFiltro(prev => ({ ...prev, disciplinaId, turmaId: '' }));
        setListVisible(false);
    }

    function handleTurmaChange(e) {
        setFiltro(prev => ({ ...prev, turmaId: e.target.value }));
        setListVisible(false);
    }

    function handleHorarioChange(e) {
        setFiltro(prev => ({ ...prev, horario: e.target.value }));
    }

    async function handleBuscar() {
        if (!filtro.disciplinaId || !filtro.turmaId || !filtro.horario) {
            toast('Selecione Matéria, Turma e Horário para continuar.', 'warning');
            return;
        }
        setLoading(true);
        const todos = await getStudents();
        const daTurma = todos.filter(a => String(a.turmaId) === String(filtro.turmaId));
        setAlunos(daTurma.map(a => ({ ...a, presente: true })));
        setListVisible(true);
        setLoading(false);
    }

    function togglePresenca(matricula) {
        setAlunos(prev => prev.map(aluno =>
            aluno.matricula === matricula ? { ...aluno, presente: !aluno.presente } : aluno
        ));
    }

    async function handleSubmit() {
        const registros = alunos.map(a => ({
            alunoId: a.id,
            presente: a.presente,
        }));

        await realizarChamada(
            Number(filtro.disciplinaId),
            new Date().toISOString(),
            registros
        );
        toast('Frequência registrada com sucesso!', 'success');
        setListVisible(false);
        setFiltro({ disciplinaId: '', turmaId: '', horario: '' });
        setTurmasFiltradas([]);
    }

    const nomeDisciplina = disciplinasUnicas.find(
        d => String(d.disciplinaId) === filtro.disciplinaId
    )?.nome ?? '';

    const nomeTurma = turmasFiltradas.find(
        t => String(t.turmaId) === filtro.turmaId
    )?.nome ?? '';

    return {
        disciplinasUnicas,
        turmasFiltradas,
        filtro,
        handleDisciplinaChange,
        handleTurmaChange,
        handleHorarioChange,
        alunos,
        loading,
        listVisible,
        nomeDisciplina,
        nomeTurma,
        handleBuscar,
        togglePresenca,
        handleSubmit,
    };
}