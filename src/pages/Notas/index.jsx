import { useNotas } from '../../hooks/useNotas';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Form/Select';
import { Input } from '../../components/Form/Input';
import { Table } from '../../components/Table';
import styles from './Notas.module.css';

export function Notas() {
    const {
        disciplinasUnicas, turmasFiltradas, filtro,
        handleDisciplinaChange, handleTurmaChange,
        alunosFiltrados, buscaNome, setBuscaNome,
        loading, listVisible,
        nomeDisciplina, nomeTurma,
        handleBuscar, handleGradeChange, handleSave,
    } = useNotas();

    return (
        <div className={styles.container}>
            <h1>Lançamento de Notas</h1>

            <Card title="Selecione a Turma">
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

                    <Button onClick={handleBuscar}>
                        <i className="fa-solid fa-list-ol"></i> Carregar Diário
                    </Button>
                </div>
            </Card>

            {listVisible && (
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3>{nomeDisciplina} — {nomeTurma}</h3>
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
                                            value={aluno.n1_b1}
                                            onChange={e => handleGradeChange(aluno.matricula, 'n1_b1', e.target.value)} />
                                    </td>
                                    <td align="center">
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.n2_b1}
                                            onChange={e => handleGradeChange(aluno.matricula, 'n2_b1', e.target.value)} />
                                    </td>
                                    <td align="center">
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.af_b1}
                                            onChange={e => handleGradeChange(aluno.matricula, 'af_b1', e.target.value)} />
                                    </td>
                                    <td align="center" style={{ borderLeft: '2px solid #eee' }}>
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.n1_b2}
                                            onChange={e => handleGradeChange(aluno.matricula, 'n1_b2', e.target.value)} />
                                    </td>
                                    <td align="center">
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.n2_b2}
                                            onChange={e => handleGradeChange(aluno.matricula, 'n2_b2', e.target.value)} />
                                    </td>
                                    <td align="center">
                                        <input className={styles.gradeInput} type="number" step="0.5"
                                            value={aluno.af_b2}
                                            onChange={e => handleGradeChange(aluno.matricula, 'af_b2', e.target.value)} />
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