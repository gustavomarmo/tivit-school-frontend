import { useAlunos } from '../../hooks/useAlunos';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Form/Input';
import { Select } from '../../components/Form/Select';
import styles from './Alunos.module.css';

export function Alunos() {
    const {
        alunosFiltrados, turmas, loading, searchTerm, setSearchTerm,
        novoAluno, setNovoAluno, handleAddStudent,
        handleDelete,
        editingAluno, setEditingAluno, editData, setEditData,
        savingEdit, openEdit, handleSaveEdit,
    } = useAlunos();

    return (
        <div className={styles.container}>
            <h1>Gestão de Alunos</h1>

            <Card>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flexGrow: 1 }}>
                        <Input
                            placeholder="Filtrar por nome, matrícula..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => document.getElementById('section-cadastro').scrollIntoView({ behavior: 'smooth' })}>
                        <i className="fa-solid fa-plus"></i> Novo Aluno
                    </Button>
                </div>
            </Card>

            <Table headers={['Matrícula', 'Nome', 'Turma', 'E-mail', 'Status', 'Ações']}>
                {loading ? (
                    <tr><td colSpan="6" align="center">Carregando...</td></tr>
                ) : alunosFiltrados.map(aluno => (
                    <tr key={aluno.matricula}>
                        <td>{aluno.matricula}</td>
                        <td>{aluno.nome}</td>
                        <td>{aluno.turma}</td>
                        <td>{aluno.email}</td>
                        <td>
                            <span style={{ color: aluno.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>
                                {aluno.status}
                            </span>
                        </td>
                        <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <IconButton icon="fa-pen" title="Editar aluno" onClick={() => openEdit(aluno)} />
                                <IconButton icon="fa-trash" title="Remover aluno" variant="danger" onClick={() => handleDelete(aluno)} />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            <Modal isOpen={!!editingAluno} onClose={() => setEditingAluno(null)} title={`Editar: ${editingAluno?.nome}`}>
                <form onSubmit={handleSaveEdit}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <Input label="Nome Completo" required autoFocus
                            value={editData.nome}
                            onChange={e => setEditData({ ...editData, nome: e.target.value })} />
                        <Input label="E-mail" type="email" required
                            value={editData.email}
                            onChange={e => setEditData({ ...editData, email: e.target.value })} />
                        <Select label="Turma" required
                            value={editData.turmaId}
                            onChange={e => setEditData({ ...editData, turmaId: e.target.value })}>
                            <option value="">Selecione...</option>
                            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </Select>
                        <Select label="Status"
                            value={editData.status}
                            onChange={e => setEditData({ ...editData, status: e.target.value })}>
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </Select>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <Button type="button" variant="icon" onClick={() => setEditingAluno(null)}>Cancelar</Button>
                            <Button type="submit" disabled={savingEdit}>
                                <i className="fa-solid fa-pen"></i>
                                {savingEdit ? 'Salvando...' : 'Salvar alterações'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <div id="section-cadastro">
                <Card title="Cadastrar Novo Aluno">
                    <form onSubmit={handleAddStudent}>
                        <div className={styles.formGrid}>
                            <Input label="Matrícula" placeholder="Ex: ABC1234" required
                                value={novoAluno.matricula}
                                onChange={e => setNovoAluno({ ...novoAluno, matricula: e.target.value })} />
                            <Input label="Nome Completo" placeholder="Ex: Gustavo Marmo" required
                                value={novoAluno.nome}
                                onChange={e => setNovoAluno({ ...novoAluno, nome: e.target.value })} />
                            <Input label="E-mail" type="email" placeholder="Ex: aluno@escola.com" required
                                value={novoAluno.email}
                                onChange={e => setNovoAluno({ ...novoAluno, email: e.target.value })} />
                            <Select label="Turma" required
                                value={novoAluno.turmaId}
                                onChange={e => setNovoAluno({ ...novoAluno, turmaId: e.target.value })}>
                                <option value="">Selecione...</option>
                                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                            </Select>
                            <Select label="Status"
                                value={novoAluno.status}
                                onChange={e => setNovoAluno({ ...novoAluno, status: e.target.value })}>
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </Select>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit">
                                <i className="fa-solid fa-check"></i> Salvar Aluno
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}