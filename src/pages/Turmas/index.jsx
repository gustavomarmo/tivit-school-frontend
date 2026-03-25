import { useTurmas } from '../../hooks/useTurmas';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Form/Input';
import { Select } from '../../components/Form/Select';
import styles from './Turmas.module.css';

export function Turmas() {
    const {
        turmasFiltradas, loading, searchTerm, setSearchTerm,
        novaTurma, setNovaTurma, savingNova, handleCriarTurma,
        handleDeletarTurma,
        turmaVinculos, setTurmaVinculos, vinculos, loadingVinculos, abrirVinculos,
        professores, disciplinas, novoVinculo, setNovoVinculo,
        savingVinculo, handleVincular, handleDesvincular,
    } = useTurmas();

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