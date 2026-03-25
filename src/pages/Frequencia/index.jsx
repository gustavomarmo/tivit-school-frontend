import { useFrequencia } from '../../hooks/useFrequencia';
import { HORARIOS_AULA } from '../../constants';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Form/Select';
import { Table } from '../../components/Table';
import styles from './Frequencia.module.css';

export function Frequencia() {
    const {
        disciplinasUnicas, turmasFiltradas, filtro,
        handleDisciplinaChange, handleTurmaChange, handleHorarioChange,
        alunos, loading, listVisible,
        nomeDisciplina, nomeTurma,
        handleBuscar, togglePresenca, handleSubmit,
    } = useFrequencia();

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
                        onChange={handleHorarioChange}
                    >
                        <option value="">Selecione...</option>
                        {HORARIOS_AULA.map(h => (
                            <option key={h.value} value={h.value}>{h.label}</option>
                        ))}
                    </Select>

                    <Button onClick={handleBuscar}>
                        <i className="fa-solid fa-magnifying-glass"></i> Carregar Alunos
                    </Button>
                </div>
            </Card>

            {listVisible && (
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
                                <tr
                                    key={aluno.matricula}
                                    style={{ backgroundColor: aluno.presente ? 'transparent' : 'rgba(192, 57, 43, 0.05)' }}
                                >
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
            )}
        </div>
    );
}