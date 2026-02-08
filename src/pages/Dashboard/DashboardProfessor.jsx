import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfessorData } from '../../services/api';
import styles from './Dashboard.module.css';

export function DashboardProfessor() {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            try {
                const resposta = await getProfessorData();
                setDados(resposta);
            } catch (error) {
                console.error("Erro ao buscar dados", error);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, []);

    if (loading) {
        return <div style={{ padding: 20 }}>Carregando painel do professor...</div>;
    }

    return (
        <div className={styles.dashboardGrid}>
            
            <div className={`${styles.widget} ${styles.areaOpcoes}`}>
                <h2>Visão Geral</h2>
                <div className={styles.opcoesGrid}>
                    <div className={styles.opcaoItem} style={{cursor: 'default'}}>
                        <i className="fa-solid fa-users-rectangle"></i>
                        <span>{dados.resumo.totalTurmas} Turmas</span>
                    </div>
                    <div className={styles.opcaoItem} style={{cursor: 'default'}}>
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>{dados.resumo.totalAlunos} Alunos</span>
                    </div>
                    <Link to="/notas" className={styles.opcaoItem} style={{backgroundColor: 'var(--brand-secondary)'}}>
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span>Lançar Notas</span>
                    </Link>
                </div>
            </div>

            <div className={`${styles.widget} ${styles.areaNotas}`}>
                <h2>⚠️ Alunos em Atenção</h2>
                <table className={styles.notasTable}>
                    <thead>
                        <tr>
                            <th>Aluno</th>
                            <th>Motivo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.alunosAtencao.map(aluno => (
                            <tr key={aluno.id}>
                                <td>
                                    <strong>{aluno.nome}</strong>
                                    <br/>
                                    <small style={{color: '#666'}}>{aluno.turma}</small>
                                </td>
                                <td>
                                    <span style={{
                                        color: aluno.risco === 'alto' ? 'red' : 'orange',
                                        fontWeight: 'bold',
                                        fontSize: '0.8rem'
                                    }}>
                                        {aluno.motivo}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={`${styles.widget} ${styles.areaNoticias}`}>
                <h2>Próximas Aulas Hoje</h2>
                <ul className={styles.noticiasList}>
                    {dados.proximasAulas.map(aula => (
                        <li key={aula.id}>
                            <span className={styles.noticiaDate}>{aula.horario}</span>
                            <p>
                                <strong>{aula.disciplina}</strong> - Turma {aula.turma}
                                <br/>
                                <small>Sala 104 - Bloco C</small>
                            </p>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}