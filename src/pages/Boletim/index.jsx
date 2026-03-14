import { useEffect, useState } from 'react';
import { getBoletim, downloadBoletimPdf } from '../../services/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import styles from './Boletim.module.css';

function TabelaBoletim({ notas }) {
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                    <tr>
                        <th rowSpan="2" style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Matéria</th>
                        <th colSpan="4" className={styles.headerGroup} style={{ backgroundColor: '#e74c3c' }}>1º Bimestre</th>
                        <th colSpan="4" className={styles.headerGroup} style={{ backgroundColor: '#c0392b' }}>2º Bimestre</th>
                        <th rowSpan="2" style={{ padding: '10px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>Média Anual</th>
                    </tr>
                    <tr style={{ backgroundColor: '#f4f4f4', fontSize: '0.9rem' }}>
                        <th>N1</th><th>N2</th><th>Ativ.</th><th>Média</th>
                        <th>N1</th><th>N2</th><th>Ativ.</th><th>Média</th>
                    </tr>
                </thead>
                <tbody>
                    {notas.map((row, index) => {
                        const mediaB1 = (row.n1_n1 + row.n1_n2 + row.n1_ativ) / 3;
                        const mediaB2 = (row.n2_n1 + row.n2_n2 + row.n2_ativ) / 3;
                        const mediaAnual = (mediaB1 + mediaB2) / 2;

                        const getStatusColor = (nota) => {
                            if (nota >= 7) return styles.aprovado;
                            if (nota < 5) return styles.reprovado;
                            return styles.recuperacao;
                        };

                        return (
                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}><strong>{row.materia}</strong></td>

                                <td align="center">{row.n1_n1.toFixed(1)}</td>
                                <td align="center">{row.n1_n2.toFixed(1)}</td>
                                <td align="center">{row.n1_ativ.toFixed(1)}</td>
                                <td align="center" className={`${styles.mediaHighlight} ${getStatusColor(mediaB1)}`}>
                                    {mediaB1.toFixed(1)}
                                </td>

                                <td align="center">{row.n2_n1.toFixed(1)}</td>
                                <td align="center">{row.n2_n2.toFixed(1)}</td>
                                <td align="center">{row.n2_ativ.toFixed(1)}</td>
                                <td align="center" className={`${styles.mediaHighlight} ${getStatusColor(mediaB2)}`}>
                                    {mediaB2.toFixed(1)}
                                </td>

                                <td align="center" style={{ fontSize: '1.1rem', fontWeight: 'bold' }} className={getStatusColor(mediaAnual)}>
                                    {mediaAnual.toFixed(1)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function Boletim() {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    async function carregar() {
            const data = await getBoletim();
            setNotas(data.map(item => ({
                materia: item.Materia ?? item.materia,
                n1_n1: item.N1_N1 ?? item.n1_N1 ?? item.n1_n1 ?? 0,
                n1_n2: item.N1_N2 ?? item.n1_N2 ?? item.n1_n2 ?? 0,
                n1_ativ: item.N1_Ativ ?? item.n1_Ativ ?? item.n1_ativ ?? 0,
                n2_n1: item.N2_N1 ?? item.n2_N1 ?? item.n2_n1 ?? 0,
                n2_n2: item.N2_N2 ?? item.n2_N2 ?? item.n2_n2 ?? 0,
                n2_ativ: item.N2_Ativ ?? item.n2_Ativ ?? item.n2_ativ ?? 0,
            })));
            setLoading(false);
        }
        carregar();
    }, []);

    async function handleDownloadPdf() {
        try {
            await downloadBoletimPdf();
        } catch {
        }
    }

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Boletim Escolar</h1>
                <Button onClick={handleDownloadPdf}>
                    <i className="fa-solid fa-file-pdf"></i> Baixar PDF
                </Button>
            </div>

            <Card>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px' }}>Carregando notas...</p>
                ) : (
                    <TabelaBoletim notas={notas} />
                )}
            </Card>
        </div>
    );
}