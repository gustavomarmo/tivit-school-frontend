import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants';
import { DashboardAluno } from './DashboardAluno';
import { DashboardProfessor } from './DashboardProfessor';
import { DashboardCoordenador } from './DashboardCoordenador';

export function Dashboard() {
    const { userRole } = useAuth();

    if (userRole === ROLES.ALUNO)       return <DashboardAluno />;
    if (userRole === ROLES.PROFESSOR)   return <DashboardProfessor />;
    if (userRole === ROLES.COORDENADOR) return <DashboardCoordenador />;

    return <p>Carregando perfil...</p>;
}