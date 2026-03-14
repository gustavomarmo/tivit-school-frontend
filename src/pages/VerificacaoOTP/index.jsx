import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { solicitarRecuperacaoSenha, validarOtpSenha, resetarSenha } from '../../services/api';
import logo from '../../assets/images/Logo Edu Connect.png';
import styles from './VerificacaoOTP.module.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export function VerificacaoOTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) navigate('/esqueci-minha-senha');
    }, [email, navigate]);

    const [passo, setPasso] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef([]);

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    useEffect(() => {
        if (passo === 1) inputRefs.current[0]?.focus();
    }, [passo]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    function handleChange(index, value) {
        const digit = value.replace(/\D/g, '').slice(-1);
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);
        setError('');

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(index, e) {
        if (e.key === 'Backspace') {
            if (digits[index]) {
                const newDigits = [...digits];
                newDigits[index] = '';
                setDigits(newDigits);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handlePaste(e) {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        const newDigits = Array(OTP_LENGTH).fill('');
        pasted.split('').forEach((ch, i) => { newDigits[i] = ch; });
        setDigits(newDigits);
        const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[nextFocus]?.focus();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        
        const code = digits.join('');

        if (passo === 1) {
            if (code.length < OTP_LENGTH) {
                setError('Preencha todos os dígitos do código.');
                return;
            }

            setLoading(true);
            try {
                await validarOtpSenha(email, code);
                setPasso(2);
            } catch (err) {
                setError(err.response?.data?.message || 'Código inválido ou expirado.');
                setDigits(Array(OTP_LENGTH).fill(''));
                setTimeout(() => inputRefs.current[0]?.focus(), 50);
            } finally {
                setLoading(false);
            }
        } else {
            if (novaSenha.length < 6) {
                setError('A senha deve ter no mínimo 6 caracteres.');
                return;
            }
            if (novaSenha !== confirmarSenha) {
                setError('As senhas não coincidem.');
                return;
            }

            setLoading(true);
            try {
                await resetarSenha(email, code, novaSenha);
                navigate('/login', { state: { recovered: true } });
            } catch (err) {
                setError(err.response?.data?.message || 'Não foi possível redefinir a senha. Tente novamente.');
            } finally {
                setLoading(false);
            }
        }
    }

    async function handleResend() {
        if (cooldown > 0 || resending) return;
        setResending(true);
        try {
            await solicitarRecuperacaoSenha(email);
            setCooldown(RESEND_COOLDOWN);
            setError('');
            setDigits(Array(OTP_LENGTH).fill(''));
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } catch {
            setError('Erro ao reenviar o código. Verifique sua conexão.');
        } finally {
            setResending(false);
        }
    }

    const isFilled = digits.every(d => d !== '');

    return (
        <div className={styles.container}>
            <div className={styles.themeBtnContainer}>
                <ThemeSwitcher />
            </div>

            <div className={styles.box}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="Edu Connect" />
                </div>

                <div className={styles.iconWrapper}>
                    <i className={passo === 1 ? "fa-solid fa-shield-halved" : "fa-solid fa-key"}></i>
                </div>

                <h2>{passo === 1 ? "Verificação" : "Nova Senha"}</h2>
                
                {passo === 1 ? (
                    <>
                        <p className={styles.description}>
                            Enviamos um código de <strong>{OTP_LENGTH} dígitos</strong> para
                        </p>
                        <p className={styles.emailHighlight}>
                            <i className="fa-solid fa-envelope"></i> {email}
                        </p>
                    </>
                ) : (
                    <p className={styles.description}>
                        Digite sua nova senha de acesso.
                    </p>
                )}

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {passo === 1 ? (
                        <div className={styles.otpGroup} onPaste={handlePaste}>
                            {digits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    className={`${styles.otpInput} ${digit ? styles.filled : ''}`}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    autoComplete="off"
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <input
                                type="password"
                                placeholder="Nova Senha"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                required
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', width: '100%' }}
                            />
                            <input
                                type="password"
                                placeholder="Confirmar Nova Senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                required
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', width: '100%' }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.btnSubmit}
                        disabled={loading || (passo === 1 && !isFilled)}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                                {passo === 1 ? "Verificando..." : "Salvando..."}
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-check"></i>
                                {passo === 1 ? "Confirmar Código" : "Redefinir Senha"}
                            </>
                        )}
                    </button>
                </form>

                {passo === 1 && (
                    <div className={styles.resendRow}>
                        <span>Não recebeu?</span>
                        <button
                            className={styles.resendBtn}
                            onClick={handleResend}
                            disabled={cooldown > 0 || resending}
                        >
                            {resending
                                ? 'Reenviando...'
                                : cooldown > 0
                                    ? `Reenviar em ${cooldown}s`
                                    : 'Reenviar código'}
                        </button>
                    </div>
                )}

                <button className={styles.backLink} onClick={() => navigate('/esqueci-minha-senha')}>
                    <i className="fa-solid fa-arrow-left"></i> {passo === 1 ? "Alterar e-mail" : "Voltar"}
                </button>
            </div>
        </div>
    );
}