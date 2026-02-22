import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import logo from '../../assets/images/Logo Edu Connect.png';
import styles from './VerificacaoOTP.module.css';

const OTP_LENGTH = 6;
const MOCK_CODE = '123456';
const RESEND_COOLDOWN = 30;

async function mockResend(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[MOCK] Código reenviado para: ${email}`);
            resolve(true);
        }, 1000);
    });
}

async function mockValidateOTP(code) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (code === MOCK_CODE) resolve(true);
            else reject('Código incorreto.');
        }, 1200);
    });
}

export function VerificacaoOTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'seu e-mail';

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

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
        const code = digits.join('');
        if (code.length < OTP_LENGTH) {
            setError('Preencha todos os dígitos do código.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await mockValidateOTP(code);
            navigate('/login', { state: { recovered: true } });
        } catch (msg) {
            setError(msg);
            setDigits(Array(OTP_LENGTH).fill(''));
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (cooldown > 0 || resending) return;
        setResending(true);
        try {
            await mockResend(email);
            setCooldown(RESEND_COOLDOWN);
            setError('');
            setDigits(Array(OTP_LENGTH).fill(''));
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
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
                    <i className="fa-solid fa-shield-halved"></i>
                </div>

                <h2>Verificação</h2>
                <p className={styles.description}>
                    Enviamos um código de <strong>{OTP_LENGTH} dígitos</strong> para
                </p>
                <p className={styles.emailHighlight}>
                    <i className="fa-solid fa-envelope"></i> {email}
                </p>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit}>
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

                    <button
                        type="submit"
                        className={styles.btnSubmit}
                        disabled={loading || !isFilled}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                                Verificando...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-check"></i>
                                Confirmar Código
                            </>
                        )}
                    </button>
                </form>

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

                <button className={styles.backLink} onClick={() => navigate('/esqueci-minha-senha')}>
                    <i className="fa-solid fa-arrow-left"></i> Alterar e-mail
                </button>
            </div>
        </div>
    );
}