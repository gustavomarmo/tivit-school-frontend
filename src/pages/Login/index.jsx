import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import logo from '../../assets/images/Logo Edu Connect.png';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { signIn } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('E-mail ou senha inválidos.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Não foi possível conectar ao servidor. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.loginContainer}>

            <div className={styles.themeBtnContainer}>
                <ThemeSwitcher />
            </div>

            <div className={styles.loginBox}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="Edu Connect" />
                </div>
                <h2>Login</h2>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>E-mail</label>
                        <div className={styles.inputWrapper}>
                            <i className="fa-solid fa-user"></i>
                            <input 
                                type="text" 
                                placeholder="ex: aluno@tivitschool.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Senha</label>
                        <div className={styles.inputWrapper}>
                            <i className="fa-solid fa-lock"></i>
                            <input 
                                type="password" 
                                placeholder="******" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-8px' }}>
                        <Link 
                            to="/esqueci-minha-senha" 
                            style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--brand-primary)', 
                                textDecoration: 'none' 
                            }}
                        >
                            Esqueci minha senha
                        </Link>
                    </div>

                    <button type="submit" className={styles.btnLogin} disabled={loading}>
                        {loading ? 'Entrando...' : 'Acessar'}
                    </button>
                </form>

                <div className={styles.registerPrompt}>
                    Ainda não é aluno? <Link to="/matricula" className={styles.registerLink}>Matricule-se</Link>
                </div>
            </div>
        </div>
    );
}