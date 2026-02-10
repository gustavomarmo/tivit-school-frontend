import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
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
        } catch (msg) {
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.loginContainer}>
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

                    <button type="submit" className={styles.btnLogin} disabled={loading}>
                        {loading ? 'Entrando...' : 'Acessar'}
                    </button>
                </form>
            </div>
        </div>
    );
}