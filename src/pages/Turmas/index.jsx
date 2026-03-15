import { useEffect, useState } from 'react';
import {
    getClasses,
    createTurma,
    deleteTurma,
    getVinculosDaTurma,
    getTeachers,
    getSubjectsList,
    vincularDisciplina,
    desvincularDisciplina,
} from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Form/Input';
import { Select } from '../../components/Form/Select';
import styles from './Turmas.module.css';

export function Turmas() {
    const { toast, confirm } = useDialog();

    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [novaTurma, setNovaTurma] = useState({ nome: '', anoLetivo: new Date().getFullYear() });
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
        getSubjectsList().then(data => {
            getDisciplinasGenericas().then(setDisciplinas);
        });
    }, []);

    async function getDisciplinasGenericas() {
        const { default: api } = await import('../../services/axiosInstance');
        const res = await api.get('/disciplinas');
        return res.data;
    }

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
        } catch {
            toast('Erro ao criar turma.', 'error');
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
        } catch {
            toast('Erro ao remover turma.', 'error');
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
            toast(err?.response?.data?.message ?? 'Erro ao criar vínculo.', 'error');
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
        } catch {
            toast('Erro ao remover vínculo.', 'error');
        }
    }

    const turmasFiltradas = turmas.filter(t =>
        t.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <h1>Gestão de Turmas</h1>

            <Card>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flexGrow: 1 }}>
                        <Input
                            placeholder="Filtrar por nome da turma..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => document.getElementById('section-cadastro-turma').scrollIntoView({ behavior: 'smooth' })}>
                        <i className="fa-solid fa-plus"></i> Nova Turma
                    </Button>
                </div>
            </Card>

            <Table headers={['Nome', 'Ano Letivo', 'Vínculos', 'Ações']}>
                {loading ? (
                    <tr><td colSpan="4" align="center">Carregando...</td></tr>
                ) : turmasFiltradas.length === 0 ? (
                    <tr><td colSpan="4" align="center">Nenhuma turma encontrada.</td></tr>
                ) : (
                    turmasFiltradas.map(turma => (
                        <tr key={turma.id}>
                            <td><strong>{turma.nome}</strong></td>
                            <td>
                                <span className={styles.anoTag}>{turma.anoLetivo ?? '—'}</span>
                            </td>
                            <td>
                                <Button
                                    variant="icon"
                                    onClick={() => abrirVinculos(turma)}
                                    title="Gerenciar matérias e professores"
                                    style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand-primary)', fontWeight: 'bold' }}
                                >
                                    <i className="fa-solid fa-link"></i> Gerenciar
                                </Button>
                            </td>
                            <td>
                                <IconButton
                                    icon="fa-trash"
                                    title="Remover turma"
                                    variant="danger"
                                    onClick={() => handleDeletarTurma(turma)}
                                />
                            </td>
                        </tr>
                    ))
                )}
            </Table>

            <div id="section-cadastro-turma">
                <Card title="Cadastrar Nova Turma">
                    <form onSubmit={handleCriarTurma}>
                        <div className={styles.formGrid}>
                            <Input
                                label="Nome da Turma"
                                placeholder="Ex: 3º Ano A"
                                required
                                value={novaTurma.nome}
                                onChange={e => setNovaTurma({ ...novaTurma, nome: e.target.value })}
                            />
                            <Input
                                label="Ano Letivo"
                                type="number"
                                required
                                value={novaTurma.anoLetivo}
                                onChange={e => setNovaTurma({ ...novaTurma, anoLetivo: Number(e.target.value) })}
                            />
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" disabled={savingNova}>
                                <i className="fa-solid fa-check"></i>
                                {savingNova ? 'Salvando...' : 'Salvar Turma'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            <Modal
                isOpen={!!turmaVinculos}
                onClose={() => setTurmaVinculos(null)}
                title={`Vínculos — ${turmaVinculos?.nome}`}
            >
                {turmaVinculos && (
                    <div>

                        <div className={styles.vinculosBox}>
                            <h4>Matérias vinculadas</h4>
                            {loadingVinculos ? (
                                <p className={styles.vinculoEmpty}>Carregando...</p>
                            ) : vinculos.length === 0 ? (
                                <p className={styles.vinculoEmpty}>
                                    <i className="fa-solid fa-link-slash" style={{ marginRight: 6 }}></i>
                                    Nenhuma matéria vinculada ainda.
                                </p>
                            ) : (
                                vinculos.map(v => (
                                    <div key={v.id} className={styles.vinculoItem}>
                                        <div className={styles.vinculoInfo}>
                                            <span className={styles.vinculoNome}>
                                                <i className="fa-solid fa-book" style={{ marginRight: 6, color: 'var(--brand-primary)' }}></i>
                                                {v.disciplina}
                                            </span>
                                            <span className={styles.vinculoMeta}>
                                                <i className="fa-solid fa-chalkboard-user" style={{ marginRight: 4 }}></i>
                                                {v.professor}
                                            </span>
                                        </div>
                                        <IconButton
                                            icon="fa-trash"
                                            title="Remover vínculo"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDesvincular(v)}
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        <div className={styles.novoVinculoForm}>
                            <h4>
                                <i className="fa-solid fa-plus" style={{ marginRight: 6, color: 'var(--brand-primary)' }}></i>
                                Adicionar vínculo
                            </h4>
                            <form onSubmit={handleVincular}>
                                <div className={styles.novoVinculoGrid}>
                                    <Select
                                        label="Disciplina"
                                        value={novoVinculo.disciplinaId}
                                        onChange={e => setNovoVinculo({ ...novoVinculo, disciplinaId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {disciplinas.map(d => (
                                            <option key={d.id} value={d.id}>{d.nome}</option>
                                        ))}
                                    </Select>
                                    <Select
                                        label="Professor"
                                        value={novoVinculo.professorId}
                                        onChange={e => setNovoVinculo({ ...novoVinculo, professorId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {professores.map(p => (
                                            <option key={p.id} value={p.id}>{p.nome}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button type="submit" disabled={savingVinculo}>
                                        <i className="fa-solid fa-link"></i>
                                        {savingVinculo ? 'Vinculando...' : 'Vincular'}
                                    </Button>
                                </div>
                            </form>
                        </div>

                    </div>
                )}
            </Modal>
        </div>
    );
}