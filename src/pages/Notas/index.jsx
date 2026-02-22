import { useEffect, useState } from 'react';
import { getClasses, getSubjectsList, getStudents, saveGrades } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Form/Select';
import { Input } from '../../components/Form/Input';
import { Table } from '../../components/Table';
import styles from './Notas.module.css';

export function Notas() {
    const { toast } = useDialog();

    const [filtro, setFiltro] = useState({ turma: '', materia: '' });
    const [turmas, setTurmas] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [buscaNome, setBuscaNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [listVisible, setListVisible] = useState(false);

    useEffect(() => {
        getClasses().then(setTurmas);
        getSubjectsList().then(setMaterias);
    }, []);

    async function handleBuscar() {
        if (!filtro.turma || !filtro.materia) {
            toast('Selecione Turma e Matéria para continuar.', 'warning');
            return;
        }
        setLoading(true);
        const dados = await getStudents();
        setAlunos(dados.map(a => ({
            ...a,
            n1_b1: '', n2_b1: '', af_b1: '',
            n1_b2: '', n2_b2: '', af_b2: ''
        })));
        setListVisible(true);
        setLoading(false);
    }

    function handleGradeChange(matricula, field, value) {
        setAlunos(prev => prev.map(aluno => {
            if (aluno.matricula === matricula) {
                if (value > 10) value = 10;
                if (value < 0) value = 0;
                return { ...aluno, [field]: value };
            }
            return aluno;
        }));
    }

    async function handleSave() {
        const payload = {
            ...filtro,
            notas: alunos.map(a => ({
                matricula: a.matricula,
                b1: { n1: a.n1_b1, n2: a.n2_b1, af: a.af_b1 },
                b2: { n1: a.n1_b2, n2: a.n2_b2, af: a.af_b2 }
            }))
        };
        await saveGrades(payload);
        toast('Notas lançadas com sucesso!', 'success');
        setListVisible(false);
        setFiltro({ turma: '', materia: '' });
    }

    const alunosFiltrados = alunos.filter(a => 
        a.nome.toLowerCase().includes(buscaNome.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <h1>Lançamento de Notas</h1>

            <Card title="Selecione a Turma">
                <div className={styles.filterGrid}>
                    <Select 
                        label="Matéria"
                        value={filtro.materia}
                        onChange={e => setFiltro({...filtro, materia: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {materias.map(m => <option key={m} value={m}>{m}</option>)}
                    </Select>

                    <Select 
                        label="Turma"
                        value={filtro.turma}
                        onChange={e => setFiltro({...filtro, turma: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {turmas.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>

                    <Button onClick={handleBuscar}>
                        <i className="fa-solid fa-list-ol"></i> Carregar Diário
                    </Button>
                </div>
            </Card>

            {listVisible && (
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3>{filtro.materia} - {filtro.turma}</h3>
                        <div style={{ width: '300px' }}>
                            <Input 
                                placeholder="Filtrar aluno por nome..."
                                value={buscaNome}
                                onChange={e => setBuscaNome(e.target.value)}
                            />
                        </div>
                    </div>

                    <Table headers={['Nome', '1º Bim (N1)', '1º Bim (N2)', '1º Bim (AF)', '2º Bim (N1)', '2º Bim (N2)', '2º Bim (AF)']}>
                        {loading ? (
                            <tr><td colSpan="7" align="center">Carregando...</td></tr>
                        ) : (
                            alunosFiltrados.map(aluno => (
                                <tr key={aluno.matricula}>
                                    <td style={{ fontWeight: 'bold' }}>{aluno.nome}</td>
                                    <td align="center">
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.n1_b1} onChange={e => handleGradeChange(aluno.matricula, 'n1_b1', e.target.value)} />
                                    </td>
                                    <td align="center">
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.n2_b1} onChange={e => handleGradeChange(aluno.matricula, 'n2_b1', e.target.value)} />
                                    </td>
                                    <td align="center">
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.af_b1} onChange={e => handleGradeChange(aluno.matricula, 'af_b1', e.target.value)} />
                                    </td>
                                    <td align="center" style={{ borderLeft: '2px solid #eee' }}>
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.n1_b2} onChange={e => handleGradeChange(aluno.matricula, 'n1_b2', e.target.value)} />
                                    </td>
                                    <td align="center">
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.n2_b2} onChange={e => handleGradeChange(aluno.matricula, 'n2_b2', e.target.value)} />
                                    </td>
                                    <td align="center">
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.af_b2} onChange={e => handleGradeChange(aluno.matricula, 'af_b2', e.target.value)} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </Table>

                    <div className={styles.footer}>
                        <Button onClick={handleSave}>
                            <i className="fa-solid fa-save"></i> Salvar Notas
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}