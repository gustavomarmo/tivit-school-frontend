import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

export function DashboardAluno() {
    return (
        <div className={styles.dashboardGrid}>
            <div className={`${styles.widget} ${styles.areaOpcoes}`}>
                <h2>Acesso Rápido</h2>
                <div className={styles.opcoesGrid}>
                    <Link to="/calendario" className={styles.opcaoItem}>
                        <i className="fa-solid fa-calendar"></i>
                        <span>Calendário</span>
                    </Link>
                    <Link to="/materias" className={styles.opcaoItem}>
                        <i className="fa-solid fa-file-pen"></i>
                        <span>Matérias</span>
                    </Link>
                    <Link to="/boletim" className={styles.opcaoItem}>
                        <i className="fa-solid fa-chart-simple"></i>
                        <span>Boletim</span>
                    </Link>
                    <Link to="/extracurricular" className={styles.opcaoItem}>
                        <i className="fa-solid fa-shapes"></i>
                        <span>Extracurricular</span>
                    </Link>
                    <Link to="#" className={styles.opcaoItem}>
                        <i className="fa-solid fa-person-running"></i>
                        <span>Saída</span>
                    </Link>
                    <Link to="#" className={styles.opcaoItem}>
                        <i className="fa-solid fa-file-arrow-down"></i>
                        <span>Documentos</span>
                    </Link>
                </div>
            </div>

            <div className={`${styles.widget} ${styles.areaNotas}`}>
                <h2>Últimas Notas Postadas</h2>
                <table className={styles.notasTable}>
                    <thead>
                        <tr>
                            <th>Disciplina</th>
                            <th>Nota</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Matemática (N1)</td><td>8.5</td></tr>
                        <tr><td>Português (N1)</td><td>9.0</td></tr>
                        <tr><td>História (N1)</td><td>7.5</td></tr>
                        <tr><td>Ciências (N1)</td><td>8.0</td></tr>
                    </tbody>
                </table>
                <p className={styles.lastUpdated}>Atualizado em: 25/10/2025</p>
            </div>

            <div className={`${styles.widget} ${styles.areaNoticias}`}>
                <h2>Notícias Recentes</h2>
                <ul className={styles.noticiasList}>
                    <li>
                        <span className={styles.noticiaDate}>26 OUT</span>
                        <p>Novo evento "Feira de Ciências" adicionado ao <Link to="/calendario" style={{fontWeight:'bold', color:'var(--brand-primary)'}}>Calendário</Link>.</p>
                    </li>
                    <li>
                        <span className={styles.noticiaDate}>24 OUT</span>
                        <p>Lançamento das notas (N2) de todas as disciplinas será no dia 05/11/2025.</p>
                    </li>
                    <li>
                        <span className={styles.noticiaDate}>20 OUT</span>
                        <p>Inscrições abertas para a gincana escolar! Fale com seu representante.</p>
                    </li>
                </ul>
            </div>

        </div>
    );
}