import { useProfessores } from '../../hooks/useProfessores';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Form/Input';
import { Select } from '../../components/Form/Select';
import styles from './Professores.module.css';

export function Professores() {
    const {
        professoresFiltrados, loading, searchTerm, setSearchTerm,
        novoProf, setNovoProf, handleAdd,
        handleDelete,
        editingProf, setEditingProf, editData, setEditData,
        savingEdit, openEdit, handleSaveEdit,
    } = useProfessores();

    return (
        <div className={styles.container}>
            <h1>Gestão de Professores</h1>

            <Card>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flexGrow: 1 }}>
                        <Input
                            placeholder="Buscar por nome, matrícula ou disciplina..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => document.getElementById('form-prof').scrollIntoView({ behavior: 'smooth' })}>
                        <i className="fa-solid fa-plus"></i> Novo Professor
                    </Button>
                </div>
            </Card>

            <Table headers={['Matrícula', 'Nome', 'Especialidade', 'E-mail', 'Status', 'Ações']}>
                {loading ? (
                    <tr><td colSpan="6" align="center">Carregando...</td></tr>
                ) : professoresFiltrados.length === 0 ? (
                    <tr><td colSpan="6" align="center">Nenhum professor encontrado.</td></tr>
                ) : (
                    professoresFiltrados.map(prof => (
                        <tr key={prof.matricula}>
                            <td>{prof.matricula}</td>
                            <td>{prof.nome}</td>
                            <td>{prof.disciplina}</td>
                            <td>{prof.email}</td>
                            <td>
                                <span style={{ color: prof.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>
                                    {prof.status}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <IconButton icon="fa-pen" title="Editar professor" onClick={() => openEdit(prof)} />
                                    <IconButton icon="fa-trash" title="Remover professor" variant="danger" onClick={() => handleDelete(prof)} />
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </Table>

            <Modal isOpen={!!editingProf} onClose={() => setEditingProf(null)} title={`Editar: ${editingProf?.nome}`}>
                <form onSubmit={handleSaveEdit}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <Input label="Nome Completo" required autoFocus
                            value={editData.nome}
                            onChange={e => setEditData({ ...editData, nome: e.target.value })} />
                        <Input label="E-mail" type="email" required
                            value={editData.email}
                            onChange={e => setEditData({ ...editData, email: e.target.value })} />
                        <Input label="Disciplina" required
                            value={editData.disciplina}
                            onChange={e => setEditData({ ...editData, disciplina: e.target.value })} />
                        <Select label="Status"
                            value={editData.status}
                            onChange={e => setEditData({ ...editData, status: e.target.value })}>
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </Select>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <Button type="button" variant="icon" onClick={() => setEditingProf(null)}>Cancelar</Button>
                            <Button type="submit" disabled={savingEdit}>
                                <i className="fa-solid fa-pen"></i>
                                {savingEdit ? 'Salvando...' : 'Salvar alterações'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <div id="form-prof">
                <Card title="Cadastrar Novo Professor">
                    <form onSubmit={handleAdd}>
                        <div className={styles.formGrid}>
                            <Input label="Matrícula" required
                                value={novoProf.matricula}
                                onChange={e => setNovoProf({ ...novoProf, matricula: e.target.value })} />
                            <Input label="Nome Completo" required
                                value={novoProf.nome}
                                onChange={e => setNovoProf({ ...novoProf, nome: e.target.value })} />
                            <Input label="Disciplina" placeholder="Ex: Matemática" required
                                value={novoProf.disciplina}
                                onChange={e => setNovoProf({ ...novoProf, disciplina: e.target.value })} />
                            <Input label="E-mail" type="email" placeholder="Ex: professor@escola.com" required
                                value={novoProf.email}
                                onChange={e => setNovoProf({ ...novoProf, email: e.target.value })} />
                            <Select label="Status"
                                value={novoProf.status}
                                onChange={e => setNovoProf({ ...novoProf, status: e.target.value })}>
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </Select>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit">
                                <i className="fa-solid fa-check"></i> Salvar Professor
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}