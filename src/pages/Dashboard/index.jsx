import { useAuth } from '../../hooks/useAuth';
import { DashboardAluno } from './DashboardAluno';

export function Dashboard() {
    const { userRole } = useAuth();

    if (userRole === 'aluno') {
        return <DashboardAluno />;
    }

    if (userRole === 'professor') {
        return <h1>Bem-vindo, Professor! (Dashboard em construção)</h1>;
    }

    if (userRole === 'coordenador') {
        return <h1>Bem-vindo, Coordenador! (Dashboard em construção)</h1>;
    }

    return <p>Carregando perfil...</p>;
}