import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    iniciarMatricula, validarOtpMatricula, checarVaga, salvarEtapaMatricula 
} from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Form/Input';
import { Select } from '../../components/Form/Select';
import logo from '../../assets/images/Logo Edu Connect.png';
import styles from './Matricula.module.css';

export function Matricula() {
    const navigate = useNavigate();
    const { toast  } = useDialog();
    const [loading, setLoading] = useState(false);

    const [step, setStep] = useState(1);
    const [matriculaData, setMatriculaData] = useState({
        nome: '', cpf: '', dataNascimento: '', email: '', telefone: '',
        otp: '', endereco: '', rgResponsavel: '', nomeResponsavel: '', contatoResponsavel: '', escolaridade: '',
        serie: '', turno: '', mensalidade: null, termosAceitos: false, pixComprovante: null
    });

    const handleChange = (e) => {
        setMatriculaData({ ...matriculaData, [e.target.name]: e.target.value });
    };

    async function handlePasso1(e) {
        e.preventDefault();
        setLoading(true);
        const res = await iniciarMatricula(matriculaData);
        setLoading(false);
        toast('Dica de Teste - O OTP gerado foi: ${res.otp}', 'warning'); 
        console.log(res.otp)
        setStep(1.5);
    }

    async function handlePassoOTP(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await validarOtpMatricula(matriculaData.email, matriculaData.otp);
            setMatriculaData({ ...matriculaData, ...data });
            
            if (data.status === 'ANALISE_COORD') setStep(4.5);
            else if (data.status === 'AGUARDANDO_PAGAMENTO') setStep(5);
            else if (data.status === 'ANALISE_PIX') setStep(5.5);
            else if (data.status === 'CONCLUIDO') setStep(6);
            else setStep(data.etapaAtual || 2);
            
            toast("Login confirmado!", "success");
        } catch (err) {
            toast(err, "error");
        } finally {
            setLoading(false);
        }
    }

    async function handlePasso2(e) {
        e.preventDefault();
        await salvarEtapaMatricula(matriculaData.email, matriculaData, 'PREENCHENDO');
        setStep(3);
    }

    async function handlePasso3(e) {
        e.preventDefault();
        setLoading(true);
        const vaga = await checarVaga(matriculaData.serie, matriculaData.turno);
        setLoading(false);

        if (!vaga.disponivel) {
            toast("Infelizmente não há vagas para esta série neste turno.", "warning");
            return;
        }

        const dataComValor = { ...matriculaData, mensalidade: vaga.valor };
        setMatriculaData(dataComValor);
        await salvarEtapaMatricula(matriculaData.email, dataComValor, 'PREENCHENDO');
        setStep(4);
    }

    async function handlePasso4(e) {
        e.preventDefault();
        if (!matriculaData.termosAceitos) return toast("Você precisa aceitar os termos.", "warning");
        
        setLoading(true);
        await salvarEtapaMatricula(matriculaData.email, matriculaData, 'ANALISE_COORD');
        setLoading(false);
        setStep(4.5);
    }

    async function handlePasso5(e) {
        e.preventDefault();
        if (!matriculaData.pixComprovante) return toast("Anexe o comprovante.", "warning");
        
        setLoading(true);
        await salvarEtapaMatricula(matriculaData.email, matriculaData, 'ANALISE_PIX');
        setLoading(false);
        setStep(5.5);
    }

    return (
        <div className={styles.portalContainer}>
            <div className={styles.wizardCard}>
                <div className={styles.header}>
                    <img src={logo} alt="Edu Connect" />
                    <span className={styles.stepIndicator}>
                        {step === 1 ? 'Passo 1: Identificação' : 
                         step === 1.5 ? 'Passo 1: Validação' :
                         step === 2 ? 'Passo 2: Dados e Documentos' :
                         step === 3 ? 'Passo 3: Seleção de Vaga' :
                         step === 4 ? 'Passo 4: Contratos' :
                         step === 5 ? 'Passo 5: Pagamento' : 'Status da Matrícula'}
                    </span>
                    <h2>Portal de Matrículas</h2>
                </div>

                {/* PASSO 1: Pré-Cadastro */}
                {step === 1 && (
                    <form onSubmit={handlePasso1} className={styles.formGrid}>
                        <div className={styles.fullWidth}><Input label="Nome Completo" name="nome" required onChange={handleChange}/></div>
                        <Input label="CPF" name="cpf" required onChange={handleChange}/>
                        <Input label="Data de Nascimento" type="date" name="dataNascimento" required onChange={handleChange}/>
                        <Input label="E-mail" type="email" name="email" required onChange={handleChange}/>
                        <Input label="Telefone / WhatsApp" name="telefone" required onChange={handleChange}/>
                        <div className={styles.actions} style={{ gridColumn: '1 / -1' }}>
                            <Button type="button" variant="danger" onClick={() => navigate('/login')}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Iniciar Matrícula'}</Button>
                        </div>
                    </form>
                )}

                {/* PASSO 1.5: OTP */}
                {step === 1.5 && (
                    <form onSubmit={handlePassoOTP} className={styles.formGrid}>
                        <div className={styles.fullWidth} style={{textAlign: 'center', marginBottom: 20}}>
                            <p>Enviamos um código de 6 dígitos para <strong>{matriculaData.email}</strong></p>
                        </div>
                        <div className={styles.fullWidth}>
                            <Input label="Código de Verificação (OTP)" name="otp" required onChange={handleChange} style={{textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px'}}/>
                        </div>
                        <div className={styles.actions} style={{ gridColumn: '1 / -1' }}>
                            <Button type="button" variant="danger" onClick={() => setStep(1)}>Voltar</Button>
                            <Button type="submit" disabled={loading}>Validar Código</Button>
                        </div>
                    </form>
                )}

                {/* PASSO 2: Dados Completos e Anexos */}
                {step === 2 && (
                    <form onSubmit={handlePasso2} className={styles.formGrid}>
                        <div className={styles.fullWidth}><Input label="Endereço Completo" name="endereco" required onChange={handleChange} value={matriculaData.endereco}/></div>
                        <Input label="RG do Aluno" name="rg" onChange={handleChange}/>
                        <Input label="Escolaridade Anterior" name="escolaridade" onChange={handleChange} value={matriculaData.escolaridade}/>
                        <div className={styles.fullWidth}><Input label="Nome do Responsável Legal" name="nomeResponsavel" required onChange={handleChange} value={matriculaData.nomeResponsavel}/></div>
                        <Input label="Contato do Responsável" name="contatoResponsavel" required onChange={handleChange} value={matriculaData.contatoResponsavel}/>
                        
                        <div className={styles.fullWidth} style={{marginTop: 20}}>
                            <h4 style={{marginBottom: 10}}>Anexos Obrigatórios</h4>
                            <div style={{display:'grid', gap:'10px', fontSize: '0.85rem'}}>
                                <div><label>1. Documento de Identidade (PDF)</label> <input type="file" accept=".pdf" required/></div>
                                <div><label>2. Histórico Escolar</label> <input type="file" required/></div>
                                <div><label>3. Comprovante de Residência</label> <input type="file" required/></div>
                                <div><label>4. Foto 3x4</label> <input type="file" accept="image/*" required/></div>
                            </div>
                        </div>

                        <div className={styles.actions} style={{ gridColumn: '1 / -1' }}>
                            <Button type="submit">Salvar e Continuar <i className="fa-solid fa-arrow-right"></i></Button>
                        </div>
                    </form>
                )}

                {/* PASSO 3: Vagas */}
                {step === 3 && (
                    <form onSubmit={handlePasso3} className={styles.formGrid}>
                        <Select label="Série Desejada" name="serie" required onChange={handleChange} value={matriculaData.serie}>
                            <option value="">Selecione...</option>
                            <option value="1º Ano EM">1º Ano Ensino Médio</option>
                            <option value="2º Ano EM">2º Ano Ensino Médio</option>
                            <option value="3º Ano EM">3º Ano Ensino Médio</option>
                        </Select>
                        <Select label="Turno" name="turno" required onChange={handleChange} value={matriculaData.turno}>
                            <option value="">Selecione...</option>
                            <option value="Manhã">Manhã</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Noite">Noite</option>
                        </Select>

                        {matriculaData.mensalidade && (
                            <div className={styles.fullWidth} style={{backgroundColor: 'rgba(39, 174, 96, 0.1)', padding: 15, borderRadius: 8, color: '#27ae60', textAlign: 'center'}}>
                                <p>Mensalidade calculada: <strong>R$ {matriculaData.mensalidade.toFixed(2)}</strong></p>
                            </div>
                        )}

                        <div className={styles.actions} style={{ gridColumn: '1 / -1' }}>
                            <Button type="submit" disabled={loading}>Consultar Vaga e Continuar</Button>
                        </div>
                    </form>
                )}

                {/* PASSO 4: Contratos */}
                {step === 4 && (
                    <form onSubmit={handlePasso4}>
                        <div className={styles.termsBox}>
                            <h4>Contrato Educacional e LGPD</h4>
                            <p>Ao marcar a caixa abaixo, o responsável legal e o aluno declaram estar cientes e de acordo com o Regimento Escolar vigente, bem como autorizam o tratamento de dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD)...</p>
                            <p><i>(Texto completo simulado)</i></p>
                        </div>
                        <div style={{marginBottom: 20}}>
                            <label style={{display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 'bold'}}>
                                <input type="checkbox" name="termosAceitos" 
                                    onChange={(e) => setMatriculaData({...matriculaData, termosAceitos: e.target.checked})} 
                                    style={{width: 20, height: 20}}/>
                                Li e aceito os termos do Contrato, Regimento e LGPD.
                            </label>
                        </div>
                        <div className={styles.actions}>
                            <Button type="submit" disabled={loading}>Assinar e Enviar para Análise</Button>
                        </div>
                    </form>
                )}

                {/* TELA 4.5: Aguardando Coordenador */}
                {step === 4.5 && (
                    <div className={styles.statusMessage}>
                        <i className="fa-regular fa-clock"></i>
                        <h3>Matrícula em Análise</h3>
                        <p>Sua documentação foi enviada para a coordenação. O prazo de resposta é de até <strong>72 horas</strong>.</p>
                        <p style={{marginTop: 15, fontSize: '0.9rem', color: '#666'}}>Você receberá um e-mail quando for aprovado para realizar o pagamento.</p>
                        <Button style={{marginTop: 20}} onClick={() => navigate('/login')}>Voltar ao Login</Button>
                    </div>
                )}

                {/* PASSO 5: Pagamento (PIX) */}
                {step === 5 && (
                    <form onSubmit={handlePasso5}>
                        <div style={{textAlign: 'center', marginBottom: 20}}>
                            <h3 style={{color: '#27ae60'}}><i className="fa-solid fa-check-circle"></i> Documentação Aprovada!</h3>
                            <p>Para finalizar sua matrícula, realize o pagamento da 1ª mensalidade.</p>
                        </div>
                        
                        <div style={{backgroundColor: '#f4f4f4', padding: 20, borderRadius: 8, textAlign: 'center', marginBottom: 20}}>
                            <h4>Chave PIX (E-mail)</h4>
                            <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>financeiro@educonnect.com</p>
                            <p>Valor: R$ {matriculaData.mensalidade}</p>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: 20}}>
                            <label style={{fontWeight:'bold'}}>Anexar Comprovante (Imagem/PDF)</label>
                            <input type="file" required onChange={e => setMatriculaData({...matriculaData, pixComprovante: 'uploaded'})} />
                        </div>

                        <div className={styles.actions}>
                            <Button type="submit" disabled={loading}>Enviar Comprovante</Button>
                        </div>
                    </form>
                )}

                {/* TELA 5.5: Aguardando Pix */}
                {step === 5.5 && (
                    <div className={styles.statusMessage}>
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                        <h3>Comprovante Enviado</h3>
                        <p>Nosso setor financeiro está validando seu pagamento.</p>
                        <p style={{marginTop: 15, fontSize: '0.9rem'}}>Assim que confirmado, você receberá seu usuário e senha de acesso ao sistema.</p>
                        <Button style={{marginTop: 20}} onClick={() => navigate('/login')}>Voltar ao Login</Button>
                    </div>
                )}

                {/* TELA 6: Concluído */}
                {step === 6 && (
                    <div className={styles.statusMessage}>
                        <i className="fa-solid fa-party-horn" style={{color: '#27ae60'}}></i>
                        <h3 style={{color: '#27ae60'}}>Matrícula Concluída!</h3>
                        <p>Seja muito bem-vindo ao Edu Connect.</p>
                        <p style={{marginTop: 15}}>Seu acesso já está liberado. Verifique seu e-mail para pegar sua senha provisória.</p>
                        <Button style={{marginTop: 20}} onClick={() => navigate('/login')}>Ir para o Login</Button>
                    </div>
                )}
            </div>
        </div>
    );
}