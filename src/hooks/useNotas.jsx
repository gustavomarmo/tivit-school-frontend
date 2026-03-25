import { useState, useEffect } from 'react';
import { getSubjectsList, getNotasParaLancamento, salvarNotasLote } from '../services/api';
import { useDialog } from '../contexts/DialogContext';

export function useNotas() {
    const { toast } = useDialog();

    const [vinculos, setVinculos] = useState([]);
    const [disciplinasUnicas, setDisciplinasUnicas] = useState([]);
    const [turmasFiltradas, setTurmasFiltradas] = useState([]);

    const [filtro, setFiltro] = useState({ disciplinaId: '', turmaId: '' });
    const [alunos, setAlunos] = useState([]);
    const [buscaNome, setBuscaNome] = useState('');
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
        setFiltro({ disciplinaId, turmaId: '' });
        setListVisible(false);
    }

    function handleTurmaChange(e) {
        setFiltro(prev => ({ ...prev, turmaId: e.target.value }));
        setListVisible(false);
    }

    async function handleBuscar() {
        if (!filtro.disciplinaId || !filtro.turmaId) {
            toast('Selecione Disciplina e Turma para continuar.', 'warning');
            return;
        }
        setLoading(true);
        const dados = await getNotasParaLancamento(filtro.turmaId, filtro.disciplinaId);
        setAlunos(dados.map(a => ({
            ...a,
            nome: a.nome ?? '',
            matricula: a.matricula ?? '',
            alunoId: a.alunoId,
            n1_b1: a.n1b1 ?? '',
            n2_b1: a.n2b1 ?? '',
            af_b1: a.ativb1 ?? '',
            n1_b2: a.n1b2 ?? '',
            n2_b2: a.n2b2 ?? '',
            af_b2: a.ativb2 ?? '',
        })));
        setListVisible(true);
        setLoading(false);
    }

    function handleGradeChange(matricula, field, value) {
        setAlunos(prev => prev.map(aluno => {
            if (aluno.matricula !== matricula) return aluno;
            if (value > 10) value = 10;
            if (value < 0) value = 0;
            return { ...aluno, [field]: value };
        }));
    }

    async function handleSave() {
        const turmaId      = Number(filtro.turmaId);
        const disciplinaId = Number(filtro.disciplinaId);

        const payload = alunos.flatMap(a => [
            { AlunoId: a.alunoId, TurmaId: turmaId, DisciplinaId: disciplinaId, Bimestre: 1, Tipo: 'N1',   Valor: Number(a.n1_b1) || 0 },
            { AlunoId: a.alunoId, TurmaId: turmaId, DisciplinaId: disciplinaId, Bimestre: 1, Tipo: 'N2',   Valor: Number(a.n2_b1) || 0 },
            { AlunoId: a.alunoId, TurmaId: turmaId, DisciplinaId: disciplinaId, Bimestre: 1, Tipo: 'Ativ', Valor: Number(a.af_b1) || 0 },
            { AlunoId: a.alunoId, TurmaId: turmaId, DisciplinaId: disciplinaId, Bimestre: 2, Tipo: 'N1',   Valor: Number(a.n1_b2) || 0 },
            { AlunoId: a.alunoId, TurmaId: turmaId, DisciplinaId: disciplinaId, Bimestre: 2, Tipo: 'N2',   Valor: Number(a.n2_b2) || 0 },
            { AlunoId: a.alunoId, TurmaId: turmaId, DisciplinaId: disciplinaId, Bimestre: 2, Tipo: 'Ativ', Valor: Number(a.af_b2) || 0 },
        ]);

        await salvarNotasLote(payload);
        toast('Notas lançadas com sucesso!', 'success');
        setListVisible(false);
        setFiltro({ disciplinaId: '', turmaId: '' });
        setTurmasFiltradas([]);
    }

    const alunosFiltrados = alunos.filter(a =>
        (a.nome ?? '').toLowerCase().includes(buscaNome.toLowerCase())
    );

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
        alunosFiltrados,
        buscaNome,
        setBuscaNome,
        loading,
        listVisible,
        nomeDisciplina,
        nomeTurma,
        handleBuscar,
        handleGradeChange,
        handleSave,
    };
}