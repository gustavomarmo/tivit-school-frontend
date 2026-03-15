import { useEffect, useState } from 'react';
import { getSubjectsList, getStudents, realizarChamada } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Form/Select';
import { Table } from '../../components/Table';
import styles from './Frequencia.module.css';

export function Frequencia() {
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
        setAlunos(alunos.map(aluno =>
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

    const nomeDisciplina = disciplinasUnicas.find(d => String(d.disciplinaId) === filtro.disciplinaId)?.nome ?? '';
    const nomeTurma      = turmasFiltradas.find(t => String(t.turmaId) === filtro.turmaId)?.nome ?? '';

    return (
        <div className={styles.container}>
            <h1>Registro de Frequência</h1>

            <Card title="Dados da Aula">
                <div className={styles.filterGrid}>
                    <Select
                        label="Matéria"
                        value={filtro.disciplinaId}
                        onChange={handleDisciplinaChange}
                    >
                        <option value="">Selecione...</option>
                        {disciplinasUnicas.map(d => (
                            <option key={d.disciplinaId} value={d.disciplinaId}>{d.nome}</option>
                        ))}
                    </Select>

                    <Select
                        label="Turma"
                        value={filtro.turmaId}
                        onChange={handleTurmaChange}
                        disabled={!filtro.disciplinaId}
                    >
                        <option value="">Selecione...</option>
                        {turmasFiltradas.map(t => (
                            <option key={t.turmaId} value={t.turmaId}>{t.nome}</option>
                        ))}
                    </Select>

                    <Select
                        label="Horário"
                        value={filtro.horario}
                        onChange={e => setFiltro(prev => ({ ...prev, horario: e.target.value }))}
                    >
                        <option value="">Selecione...</option>
                        <option value="07:30">07:30 - 08:20 (1º Aula)</option>
                        <option value="08:20">08:20 - 09:10 (2º Aula)</option>
                        <option value="09:10">09:10 - 10:00 (3º Aula)</option>
                        <option value="10:20">10:20 - 11:10 (4º Aula)</option>
                    </Select>

                    <Button onClick={handleBuscar}>
                        <i className="fa-solid fa-magnifying-glass"></i> Carregar Alunos
                    </Button>
                </div>
            </Card>

            {listVisible && (
                <div className="animate-fade-in">
                    <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                            <h3>{nomeDisciplina} — {nomeTurma}</h3>
                            <span>Total: <strong>{alunos.length}</strong> alunos</span>
                        </div>

                        <Table headers={['Matrícula', 'Nome', 'Presença', 'Situação']}>
                            {loading ? (
                                <tr><td colSpan="4" align="center">Carregando...</td></tr>
                            ) : alunos.length === 0 ? (
                                <tr><td colSpan="4" align="center">Nenhum aluno encontrado para esta turma.</td></tr>
                            ) : (
                                alunos.map(aluno => (
                                    <tr key={aluno.matricula} style={{ backgroundColor: aluno.presente ? 'transparent' : 'rgba(192, 57, 43, 0.05)' }}>
                                        <td>{aluno.matricula}</td>
                                        <td>{aluno.nome}</td>
                                        <td align="center">
                                            <div className={styles.checkboxContainer}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.checkbox}
                                                    checked={aluno.presente}
                                                    onChange={() => togglePresenca(aluno.matricula)}
                                                />
                                            </div>
                                        </td>
                                        <td align="center">
                                            <span className={aluno.presente ? styles.statusPresente : styles.statusAusente}>
                                                {aluno.presente ? 'PRESENTE' : 'AUSENTE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </Table>

                        <div className={styles.footer}>
                            <div style={{ marginRight: 'auto', fontSize: '0.9rem', color: '#666' }}>
                                Resumo: {alunos.filter(a => a.presente).length} Presentes / {alunos.filter(a => !a.presente).length} Ausentes
                            </div>
                            <Button onClick={handleSubmit} disabled={alunos.length === 0}>
                                <i className="fa-solid fa-paper-plane"></i> Enviar Frequência
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}