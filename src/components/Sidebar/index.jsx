import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants';
import styles from './Sidebar.module.css';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar({ isOpen }) {
    const { userRole } = useAuth();
    const location = useLocation();

    const allNavLinks = [
        { path: '/',                     icon: 'fa-solid fa-house',                text: 'Início',      roles: [ROLES.ALUNO, ROLES.PROFESSOR, ROLES.COORDENADOR] },
        { path: '/calendario',           icon: 'fa-solid fa-calendar',             text: 'Calendário',  roles: [ROLES.ALUNO, ROLES.PROFESSOR, ROLES.COORDENADOR] },
        { path: '/materias',             icon: 'fa-solid fa-folder-open',           text: 'Matérias',    roles: [ROLES.ALUNO, ROLES.PROFESSOR] },
        { path: '/boletim',              icon: 'fa-solid fa-chart-simple',          text: 'Boletim',     roles: [ROLES.ALUNO] },
        { path: '/frequencia',           icon: 'fa-solid fa-list-check',            text: 'Frequência',  roles: [ROLES.PROFESSOR] },
        { path: '/notas',                icon: 'fa-solid fa-pen-to-square',         text: 'Lançar Notas',roles: [ROLES.PROFESSOR] },
        { path: '/alunos',               icon: 'fa-solid fa-person',               text: 'Alunos',      roles: [ROLES.COORDENADOR] },
        { path: '/professores',          icon: 'fa-solid fa-person-chalkboard',     text: 'Professores', roles: [ROLES.COORDENADOR] },
        { path: '/aprovacao-matriculas', icon: 'fa-solid fa-file-signature',        text: 'Matrículas',  roles: [ROLES.COORDENADOR] },
        { path: '/turmas',               icon: 'fa-solid fa-chalkboard',            text: 'Turmas',      roles: [ROLES.COORDENADOR] },
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