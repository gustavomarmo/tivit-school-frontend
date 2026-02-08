import { useEffect, useState } from 'react';
import { getCoordinatorData } from '../../services/api';
import styles from './Dashboard.module.css';

// Importações do Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function DashboardCoordenador() {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            const resposta = await getCoordinatorData();
            setDados(resposta);
            setLoading(false);
        }
        carregar();
    }, []);

    if (loading) return <div style={{padding: 20}}>Carregando estatísticas...</div>;

    const optionsBar = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Média Geral por Disciplina' },
        },
    };

    const dataBar = {
        labels: dados.desempenhoPorMateria.labels,
        datasets: [
            {
                label: 'Média de Notas',
                data: dados.desempenhoPorMateria.medias,
                backgroundColor: 'rgba(242, 0, 36, 0.6)',
                borderColor: 'rgba(242, 0, 36, 1)',
                borderWidth: 1,
            },
        ],
    };

    const dataDoughnut = {
        labels: dados.statusAlunos.labels,
        datasets: [
            {
                label: '# de Alunos',
                data: dados.statusAlunos.quantidades,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className={styles.dashboardGridCoordinator}>
            
            <div className={`${styles.widget} ${styles.areaOpcoes}`}>
                <h2>Estatísticas Gerais</h2>
                <div className={styles.opcoesGrid}>
                    <div className={styles.opcaoItem} style={{cursor: 'default', backgroundColor: '#262626'}}>
                        <i className="fa-solid fa-users"></i>
                        <span>{dados.resumo.totalAlunos} Alunos</span>
                    </div>
                    <div className={styles.opcaoItem} style={{cursor: 'default', backgroundColor: '#262626'}}>
                        <i className="fa-solid fa-chalkboard-user"></i>
                        <span>{dados.resumo.totalProfessores} Profs</span>
                    </div>
                    <div className={styles.opcaoItem} style={{cursor: 'default', backgroundColor: '#262626'}}>
                        <i className="fa-solid fa-door-open"></i>
                        <span>{dados.resumo.turmasAtivas} Turmas</span>
                    </div>
                </div>
            </div>

            <div className={`${styles.widget} ${styles.areaGrafico1}`}>
                <div className={styles.chartContainer}>
                    <Bar options={optionsBar} data={dataBar} />
                </div>
            </div>

            <div className={`${styles.widget} ${styles.areaGrafico2}`}>
                <h2 style={{fontSize: '1rem', textAlign: 'center'}}>Situação Acadêmica</h2>
                <div className={styles.chartContainer} style={{height: '250px'}}>
                    <Doughnut data={dataDoughnut} />
                </div>
            </div>

        </div>
    );
}