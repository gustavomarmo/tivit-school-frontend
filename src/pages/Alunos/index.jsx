import { useEffect, useState } from 'react';
import { getStudents, addStudent, deleteStudent } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
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
                    <Button 
                        onClick={() => document.getElementById('section-cadastro').scrollIntoView({behavior: 'smooth'})}
                    >
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
                            <span style={{ 
                                color: aluno.status === 'Ativo' ? 'green' : 'red', 
                                fontWeight: 'bold' 
                            }}>
                                {aluno.status}
                            </span>
                        </td>
                        <td>
                            <Button 
                                variant="danger" 
                                onClick={() => handleDelete(aluno)}
                                title="Remover"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </Button>
                        </td>
                    </tr>
                ))}
            </Table>

            <div id="section-cadastro">
                <Card title="Cadastrar Novo Aluno">
                    <form onSubmit={handleAddStudent}>
                        <div className={styles.formGrid}>
                            <Input 
                                label="Matrícula"
                                placeholder="Ex: ABC1234"
                                required 
                                value={novoAluno.matricula}
                                onChange={e => setNovoAluno({...novoAluno, matricula: e.target.value})}
                            />
                            <Input 
                                label="Nome Completo"
                                placeholder="Ex: Gustavo Marmo"
                                required 
                                value={novoAluno.nome}
                                onChange={e => setNovoAluno({...novoAluno, nome: e.target.value})}
                            />
                            <Input 
                                label="Turma"
                                placeholder="Ex: 9º Ano A" 
                                required 
                                value={novoAluno.turma}
                                onChange={e => setNovoAluno({...novoAluno, turma: e.target.value})}
                            />
                            <Select 
                                label="Status"
                                value={novoAluno.status}
                                onChange={e => setNovoAluno({...novoAluno, status: e.target.value})}
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