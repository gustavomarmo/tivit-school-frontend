import { useEffect, useState } from 'react';
import { getMatriculasPendentes, avaliarMatriculaCoord } from '../../services/api';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { useDialog } from '../../contexts/DialogContext';

export function AprovacaoMatriculas() {
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatricula, setSelectedMatricula] = useState(null);
    const { toast } = useDialog();

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        setLoading(true);
        const dados = await getMatriculasPendentes();
        setMatriculas(dados);
        setLoading(false);
    }

    const getStatusText = (status) => {
        if (status === 'ANALISE_COORD') return 'Aguardando Aprovação de Docs';
        if (status === 'AGUARDANDO_PAGAMENTO') return 'Aguardando Aluno Pagar';
        if (status === 'ANALISE_PIX') return 'Aguardando Aprovação de PIX';
        if (status === 'CONCLUIDO') return 'Matriculado';
        return status;
    };
    
    async function handleAprovar() {
        try {
            await avaliarMatriculaCoord(selectedMatricula.id, true);
            toast('Matrícula aprovada com sucesso!', 'success');
            setSelectedMatricula(null);
            carregarDados();
        } catch (err) {
            toast(err?.response?.data?.mensagem ?? 'Erro ao aprovar matrícula.', 'error');
        }
    }

    async function handleRejeitar() {
        if (confirm('Deseja realmente rejeitar e pedir reenvio?')) {
            try {
                await avaliarMatriculaCoord(selectedMatricula.id, false, 'Documentação devolvida para correção.');
                toast('Devolvido ao aluno.', 'info');
                setSelectedMatricula(null);
                carregarDados();
            } catch (err) {
                toast(err?.response?.data?.mensagem ?? 'Erro ao rejeitar matrícula.', 'error');
            }
        }
    }

    return (
        <div className="animate-fade-in">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
                <h1>Aprovação de Matrículas</h1>
                <Button variant="secondary" onClick={carregarDados}>Atualizar</Button>
            </div>

            <Card>
                <Table headers={['Candidato', 'Série Solicitada', 'Turno', 'Status Atual', 'Ação']}>
                    {loading ? (
                        <tr><td colSpan="5" align="center">Carregando...</td></tr>
                    ) : matriculas.length === 0 ? (
                        <tr><td colSpan="5" align="center">Nenhuma matrícula pendente.</td></tr>
                    ) : (
                        matriculas.map(m => (
                            <tr key={m.id}>
                                <td>
                                    <strong>{m.nome}</strong><br/>
                                    <small style={{color: '#666'}}>{m.email}</small>
                                </td>
                                <td>{m.serie}</td>
                                <td>{m.turno}</td>
                                <td>
                                    <span style={{
                                        backgroundColor: m.status === 'CONCLUIDO' ? 'rgba(39,174,96,0.1)' : 'rgba(243,156,18,0.1)',
                                        color: m.status === 'CONCLUIDO' ? '#27ae60' : '#f39c12',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold'
                                    }}>
                                        {getStatusText(m.status)}
                                    </span>
                                </td>
                                <td>
                                    <Button onClick={() => setSelectedMatricula(m)}>Analisar</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </Table>
            </Card>

            <Modal 
                isOpen={!!selectedMatricula} 
                onClose={() => setSelectedMatricula(null)} 
                title={`Analisar: ${selectedMatricula?.nome}`}
            >
                {selectedMatricula && (
                    <div>
                        <div style={{marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.9rem'}}>
                            <p><strong>CPF:</strong> {selectedMatricula.cpf}</p>
                            <p><strong>Telefone:</strong> {selectedMatricula.telefone}</p>
                            <p><strong>Responsável:</strong> {selectedMatricula.nomeResponsavel}</p>
                            <p><strong>Vaga:</strong> {selectedMatricula.serie} - {selectedMatricula.turno}</p>
                        </div>

                        {selectedMatricula.status === 'ANALISE_COORD' && (
                            <div style={{backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 20}}>
                                <h4>Documentos Anexados:</h4>
                                <ul style={{paddingLeft: 20, marginTop: 10}}>
                                    {selectedMatricula.documentos?.length > 0 ? (
                                        selectedMatricula.documentos.map((doc, i) => (
                                            <li key={i}>
                                                <a href={doc.url} target="_blank" rel="noreferrer" style={{color: 'blue'}}>
                                                    {doc.nomeOriginal ?? doc.tipo}
                                                </a>
                                            </li>
                                        ))
                                    ) : (
                                        <>
                                            <li><span style={{color: '#999'}}>Identidade</span></li>
                                            <li><span style={{color: '#999'}}>Histórico Escolar</span></li>
                                            <li><span style={{color: '#999'}}>Comprovante de Residência</span></li>
                                            <li><span style={{color: '#999'}}>Foto 3x4</span></li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        )}

                        {selectedMatricula.status === 'ANALISE_PIX' && (
                            <div style={{backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 20, textAlign: 'center'}}>
                                <h4>Comprovante PIX:</h4>
                                <i className="fa-solid fa-file-invoice-dollar" style={{fontSize: '3rem', color: 'green', margin: '10px 0'}}></i>
                                {selectedMatricula.documentos?.find(d => d.tipo === 'ComprovantePagamento') ? (
                                    <p>
                                        <a 
                                            href={selectedMatricula.documentos.find(d => d.tipo === 'ComprovantePagamento').url}
                                            target="_blank" rel="noreferrer" style={{color: 'blue'}}
                                        >
                                            Ver Comprovante
                                        </a>
                                    </p>
                                ) : (
                                    <p><a href="#" style={{color: 'blue'}}>Ver Comprovante.pdf</a></p>
                                )}
                            </div>
                        )}

                        {selectedMatricula.status === 'AGUARDANDO_PAGAMENTO' && (
                            <p style={{color: 'orange', textAlign: 'center', marginBottom: 20}}>
                                Aguardando o aluno realizar o pagamento no Portal.
                            </p>
                        )}

                        {selectedMatricula.status !== 'AGUARDANDO_PAGAMENTO' && selectedMatricula.status !== 'CONCLUIDO' && (
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 10}}>
                                <Button variant="danger" onClick={handleRejeitar}>Rejeitar</Button>
                                <Button onClick={handleAprovar} style={{backgroundColor: '#27ae60'}}>
                                    <i className="fa-solid fa-check"></i> Aprovar Matrícula
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}