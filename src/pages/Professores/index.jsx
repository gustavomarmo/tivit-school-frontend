import { useEffect, useState } from 'react';
import { getTeachers, addTeacher, deleteTeacher } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Input } from '../../components/Form/Input';
import { Select } from '../../components/Form/Select';
import styles from './Professores.module.css';

export function Professores() {
    const { toast, confirm } = useDialog();

    const [professores, setProfessores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [novoProf, setNovoProf] = useState({
        matricula: '', nome: '', disciplina: '', status: 'Ativo'
    });

    useEffect(() => {
        carregarProfessores();
    }, []);

    async function carregarProfessores() {
        setLoading(true);
        const dados = await getTeachers();
        setProfessores(dados);
        setLoading(false);
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!novoProf.matricula || !novoProf.nome || !novoProf.disciplina) {
            toast('Preencha todos os campos obrigatórios.', 'warning');
            return;
        }
        try {
            await addTeacher(novoProf);
            toast('Professor cadastrado com sucesso!', 'success');
            setNovoProf({ matricula: '', nome: '', disciplina: '', status: 'Ativo' });
            carregarProfessores();
        } catch (error) {
            console.error(error);
            toast('Erro ao cadastrar professor.', 'error');
        }
    }

    async function handleDelete(prof) {
        const ok = await confirm(`Remover o professor "${prof.nome}"? Esta ação não pode ser desfeita.`);
        if (!ok) return;
        await deleteTeacher(prof.matricula);
        setProfessores(prev => prev.filter(p => p.matricula !== prof.matricula));
        toast('Professor removido.', 'success');
    }

    const professoresFiltrados = professores.filter(p => 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.matricula.includes(searchTerm) ||
        p.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <h1>Gestão de Professores</h1>

            <Card>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flexGrow: 1 }}>
                        <Input 
                            placeholder="Buscar por nome, matrícula ou disciplina..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={() => document.getElementById('form-prof').scrollIntoView({behavior: 'smooth'})}
                    >
                        <i className="fa-solid fa-plus"></i> Novo Professor
                    </Button>
                </div>
            </Card>

            <Table headers={['Matrícula', 'Nome', 'Disciplina', 'Status', 'Ações']}>
                {loading ? (
                    <tr><td colSpan="5" align="center">Carregando...</td></tr>
                ) : professoresFiltrados.length === 0 ? (
                    <tr><td colSpan="5" align="center">Nenhum professor encontrado.</td></tr>
                ) : (
                    professoresFiltrados.map(prof => (
                        <tr key={prof.matricula}>
                            <td>{prof.matricula}</td>
                            <td>{prof.nome}</td>
                            <td>{prof.disciplina}</td>
                            <td>
                                <span style={{ 
                                    color: prof.status === 'Ativo' ? 'green' : 'red', 
                                    fontWeight: 'bold' 
                                }}>
                                    {prof.status}
                                </span>
                            </td>
                            <td>
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleDelete(prof)}
                                    title="Remover"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </Button>
                            </td>
                        </tr>
                    ))
                )}
            </Table>

            <div id="form-prof">
                <Card title="Cadastrar Novo Professor">
                    <form onSubmit={handleAdd}>
                        <div className={styles.formGrid}>
                            <Input 
                                label="Matrícula"
                                required 
                                value={novoProf.matricula}
                                onChange={e => setNovoProf({...novoProf, matricula: e.target.value})}
                            />
                            <Input 
                                label="Nome Completo"
                                required 
                                value={novoProf.nome}
                                onChange={e => setNovoProf({...novoProf, nome: e.target.value})}
                            />
                            <Input 
                                label="Disciplina"
                                placeholder="Ex: Matemática" 
                                required 
                                value={novoProf.disciplina}
                                onChange={e => setNovoProf({...novoProf, disciplina: e.target.value})}
                            />
                            <Select 
                                label="Status"
                                value={novoProf.status}
                                onChange={e => setNovoProf({...novoProf, status: e.target.value})}
                            >
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