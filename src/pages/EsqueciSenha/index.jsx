import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import logo from '../../assets/images/Logo Edu Connect.png';
import styles from './EsqueciSenha.module.css';

async function mockSendRecoveryEmail(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[MOCK] Código OTP enviado para: ${email} | Código: 1234`);
            resolve(true);
        }, 1800);
    });
}

export function EsqueciSenha() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Por favor, informe um e-mail válido.');
            return;
        }

        setLoading(true);
        try {
            await mockSendRecoveryEmail(email);
            navigate('/esqueci-minha-senha/codigo-otp', { state: { email } });
        } catch {
            setError('Não foi possível enviar o código. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

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
                    <i className="fa-solid fa-lock-open"></i>
                </div>

                <h2>Recuperar Senha</h2>
                <p className={styles.description}>
                    Informe o e-mail cadastrado e enviaremos um código de verificação.
                </p>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="recovery-email">E-mail</label>
                        <div className={styles.inputWrapper}>
                            <i className="fa-solid fa-envelope"></i>
                            <input
                                id="recovery-email"
                                type="email"
                                placeholder="seuemail@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.btnSubmit} disabled={loading}>
                        {loading ? (
                            <>
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-paper-plane"></i>
                                Enviar Código
                            </>
                        )}
                    </button>
                </form>

                <button className={styles.backLink} onClick={() => navigate('/login')}>
                    <i className="fa-solid fa-arrow-left"></i> Voltar para o login
                </button>
            </div>
        </div>
    );
}