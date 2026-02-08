import { useAuth } from '../../hooks/useAuth';
import { DashboardAluno } from './DashboardAluno';
import { DashboardProfessor } from './DashboardProfessor';

export function Dashboard() {
    const { userRole } = useAuth();

    if (userRole === 'aluno') {
        return <DashboardAluno />;
    }

    if (userRole === 'professor') {
        return <DashboardProfessor />;
    }

    if (userRole === 'coordenador') {
        return <h1>Bem-vindo, Coordenador! (Dashboard em construção)</h1>;
    }

    return <p>Carregando perfil...</p>;
}