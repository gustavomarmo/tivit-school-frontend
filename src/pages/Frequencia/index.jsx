import { useEffect, useState } from 'react';
import { getClasses, getSubjectsList, getStudents, realizarChamada } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Form/Select';
import { Table } from '../../components/Table';
import styles from './Frequencia.module.css';

export function Frequencia() {
    const { toast } = useDialog();

    const [turmas, setTurmas] = useState([]);
    const [materias, setMaterias] = useState([]);
    
    const [filtro, setFiltro] = useState({ turma: '', materia: '', horario: '' });
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [listVisible, setListVisible] = useState(false);

    useEffect(() => {
        getClasses().then(setTurmas);
        getSubjectsList().then(setMaterias);
    }, []);

    async function handleBuscar() {
        if (!filtro.turma || !filtro.materia || !filtro.horario) {
            toast('Selecione Turma, Matéria e Horário para continuar.', 'warning');
            return;
        }
        setLoading(true);

        const todos = await getStudents();
        const daTurma = todos.filter(a => String(a.turmaId) === String(filtro.turma) || a.turma === filtro.turma);
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
            Number(filtro.materia),
            new Date().toISOString(),  
            registros
        );
        toast('Frequência registrada com sucesso!', 'success');
        setListVisible(false);
        setFiltro({ turma: '', materia: '', horario: '' });
    }

    return (
        <div className={styles.container}>
            <h1>Registro de Frequência</h1>

            <Card title="Dados da Aula">
                <div className={styles.filterGrid}>
                    <Select 
                        label="Matéria"
                        value={filtro.materia}
                        onChange={e => setFiltro({...filtro, materia: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </Select>

                    <Select 
                        label="Turma"
                        value={filtro.turma}
                        onChange={e => setFiltro({...filtro, turma: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </Select>

                    <Select 
                        label="Horário"
                        value={filtro.horario}
                        onChange={e => setFiltro({...filtro, horario: e.target.value})}
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
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom: 15}}>
                            <h3>Lista de Chamada: {filtro.turma}</h3>
                            <span>Total: <strong>{alunos.length}</strong> alunos</span>
                        </div>

                        <Table headers={['Matrícula', 'Nome', 'Presença', 'Situação']}>
                            {loading ? (
                                <tr><td colSpan="4" align="center">Carregando...</td></tr>
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
                            <Button onClick={handleSubmit}>
                                <i className="fa-solid fa-paper-plane"></i> Enviar Frequência
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}