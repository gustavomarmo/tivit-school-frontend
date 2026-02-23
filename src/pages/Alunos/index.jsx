import { useEffect, useState } from 'react';
import { getStudents, addStudent, deleteStudent, editStudent } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Form/Input';
import { Select } from '../../components/Form/Select';
import styles from './Alunos.module.css';

export function Alunos() {
    const { toast, confirm } = useDialog();

    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [novoAluno, setNovoAluno] = useState({
        matricula: '', nome: '', turma: '', status: 'Ativo'
    });

    const [editingAluno, setEditingAluno] = useState(null);
    const [editData, setEditData] = useState({ nome: '', turma: '', status: 'Ativo' });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        carregarAlunos();
    }, []);

    async function carregarAlunos() {
        setLoading(true);
        const dados = await getStudents();
        setAlunos(dados);
        setLoading(false);
    }

    async function handleAddStudent(e) {
        e.preventDefault();
        try {
            await addStudent(novoAluno);
            toast('Aluno cadastrado com sucesso!', 'success');
            setNovoAluno({ matricula: '', nome: '', turma: '', status: 'Ativo' });
            carregarAlunos();
        } catch (error) {
            console.error(error);
            toast('Erro ao cadastrar aluno.', 'error');
        }
    }

    async function handleDelete(aluno) {
        const ok = await confirm(`Remover o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`);
        if (!ok) return;
        await deleteStudent(aluno.matricula);
        setAlunos(prev => prev.filter(a => a.matricula !== aluno.matricula));
        toast('Aluno removido.', 'success');
    }

    function openEdit(aluno) {
        setEditingAluno(aluno);
        setEditData({ nome: aluno.nome, turma: aluno.turma, status: aluno.status });
    }

    async function handleSaveEdit(e) {
        e.preventDefault();
        setSavingEdit(true);
        try {
            await editStudent(editingAluno.matricula, editData);
            toast('Aluno atualizado com sucesso!', 'success');
            setEditingAluno(null);
            carregarAlunos();
        } catch {
            toast('Erro ao editar aluno.', 'error');
        } finally {
            setSavingEdit(false);
        }
    }

    const alunosFiltrados = alunos.filter(aluno =>
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.matricula.includes(searchTerm)
    );

    return (
        <div className={styles.container}>
            <h1>Gestão de Alunos</h1>

            <Card className={styles.filterCard}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flexGrow: 1 }}>
                        <Input
                            placeholder="Filtrar por nome, matrícula..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => document.getElementById('section-cadastro').scrollIntoView({ behavior: 'smooth' })}>
                        <i className="fa-solid fa-plus"></i> Novo Aluno
                    </Button>
                </div>
            </Card>

            <Table headers={['Matrícula', 'Nome', 'Turma', 'Status', 'Ações']}>
                {loading ? (
                    <tr><td colSpan="5" align="center">Carregando...</td></tr>
                ) : alunosFiltrados.map(aluno => (
                    <tr key={aluno.matricula}>
                        <td>{aluno.matricula}</td>
                        <td>{aluno.nome}</td>
                        <td>{aluno.turma}</td>
                        <td>
                            <span style={{ color: aluno.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>
                                {aluno.status}
                            </span>
                        </td>
                        <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <IconButton
                                    icon="fa-pen"
                                    title="Editar aluno"
                                    onClick={() => openEdit(aluno)}
                                />
                                <IconButton
                                    icon="fa-trash"
                                    title="Remover aluno"
                                    variant="danger"
                                    onClick={() => handleDelete(aluno)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            <Modal isOpen={!!editingAluno} onClose={() => setEditingAluno(null)} title={`Editar: ${editingAluno?.nome}`}>
                <form onSubmit={handleSaveEdit}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <Input
                            label="Nome Completo"
                            required
                            autoFocus
                            value={editData.nome}
                            onChange={e => setEditData({ ...editData, nome: e.target.value })}
                        />
                        <Input
                            label="Turma"
                            required
                            value={editData.turma}
                            onChange={e => setEditData({ ...editData, turma: e.target.value })}
                        />
                        <Select
                            label="Status"
                            value={editData.status}
                            onChange={e => setEditData({ ...editData, status: e.target.value })}
                        >
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
                            <Input
                                label="Matrícula"
                                placeholder="Ex: ABC1234"
                                required
                                value={novoAluno.matricula}
                                onChange={e => setNovoAluno({ ...novoAluno, matricula: e.target.value })}
                            />
                            <Input
                                label="Nome Completo"
                                placeholder="Ex: Gustavo Marmo"
                                required
                                value={novoAluno.nome}
                                onChange={e => setNovoAluno({ ...novoAluno, nome: e.target.value })}
                            />
                            <Input
                                label="Turma"
                                placeholder="Ex: 9º Ano A"
                                required
                                value={novoAluno.turma}
                                onChange={e => setNovoAluno({ ...novoAluno, turma: e.target.value })}
                            />
                            <Select
                                label="Status"
                                value={novoAluno.status}
                                onChange={e => setNovoAluno({ ...novoAluno, status: e.target.value })}
                            >
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