import { useAuth } from '../../hooks/useAuth';
import { DashboardAluno } from './DashboardAluno';
import { DashboardProfessor } from './DashboardProfessor';
import { DashboardCoordenador } from './DashboardCoordenador';

export function Dashboard() {
    const { userRole } = useAuth();

    if (userRole === 'aluno') {
        return <DashboardAluno />;
    }

    if (userRole === 'professor') {
        return <DashboardProfessor />;
    }

    if (userRole === 'coordenador') {
        return <DashboardCoordenador />;
    }

    return <p>Carregando perfil...</p>;
}