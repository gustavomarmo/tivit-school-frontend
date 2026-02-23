import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ isOpen }) {
    const { userRole } = useAuth();
    const location = useLocation();

    const allNavLinks = [
        { path: '/', icon: 'fa-solid fa-house', text: 'Início', roles: ['aluno', 'professor', 'coordenador'] },
        { path: '/calendario', icon: 'fa-solid fa-calendar', text: 'Calendário', roles: ['aluno', 'professor', 'coordenador'] },
        { path: '/materias', icon: 'fa-solid fa-folder-open', text: 'Matérias', roles: ['aluno', 'professor'] },
        { path: '/boletim', icon: 'fa-solid fa-chart-simple', text: 'Boletim', roles: ['aluno'] },
        { path: '/frequencia', icon: 'fa-solid fa-list-check', text: 'Frequência', roles: ['professor'] },
        { path: '/notas', icon: 'fa-solid fa-pen-to-square', text: 'Lançar Notas', roles: ['professor'] },
        { path: '/alunos', icon: 'fa-solid fa-person', text: 'Alunos', roles: ['coordenador'] },
        { path: '/professores', icon: 'fa-solid fa-person-chalkboard', text: 'Professores', roles: ['coordenador'] },
        { path: '/aprovacao-matriculas', icon: 'fa-solid fa-file-signature', text: 'Matrículas', roles: ['coordenador'] },
    ];

    const linksToRender = allNavLinks.filter(link => link.roles.includes(userRole));

    return (
        <nav className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
            <ul className={styles.navLinks}>
                {linksToRender.map((link) => (
                    <li key={link.path}>
                        <Link 
                            to={link.path} 
                            className={`${styles.navLink} ${location.pathname === link.path ? styles.activeLink : ''}`}
                        >
                            <i className={link.icon}></i>
                            <span className={styles.linkText}>{link.text}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}