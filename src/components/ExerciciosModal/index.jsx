import { useState } from 'react';
import { Button } from '../Button';
import styles from './ExerciciosModal.module.css';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function parseQuestions(rawText) {
    const blocks = rawText.split(/(?=Questão\s+\d+[:.]?)/i).filter(b => b.trim());

    return blocks.map((block, idx) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

        const questionLine = lines[0].replace(/^Questão\s+\d+[:.]?\s*/i, '').trim();

        const optionRegex = /^([a-e])\)\s*(.+)/i;
        const options = lines
            .filter(l => optionRegex.test(l))
            .map(l => {
                const m = l.match(optionRegex);
                return { letter: m[1].toUpperCase(), text: m[2].trim() };
            });

        const answerLine = lines.find(l => /^Resposta[:.]?\s*/i.test(l)) || '';
        const answerMatch = answerLine.match(/Resposta[:.]?\s*([a-e])/i);
        const answer = answerMatch ? answerMatch[1].toUpperCase() : null;

        return {
            id: idx + 1,
            text: questionLine || `Questão ${idx + 1}`,
            options,
            answer,
        };
    });
}

export function ExerciciosModal({ isOpen, onClose, material }) {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const [showAnswers, setShowAnswers] = useState(false);
    const [generated, setGenerated] = useState(false);

    if (!isOpen) return null;

        async function handleGenerate() {
            setLoading(true);
            setError('');
            setQuestions([]);
            setShowAnswers(false);
            setGenerated(false);

            try {
                let pdfText = '';

                const fileData = material.fileObject instanceof File
                    ? material.fileObject
                    : null;

                if (!fileData) {
                    throw new Error('Arquivo PDF não encontrado em memória. Feche e adicione o material novamente.');
                }

                const arrayBuffer = await fileData.arrayBuffer();

                const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const maxPages = Math.min(pdfDoc.numPages, 10);

                for (let i = 1; i <= maxPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items.map(item => item.str).join(' ');
                    pdfText += pageText + '\n';
                }

                if (!pdfText.trim()) {
                    throw new Error('Não foi possível extrair texto do PDF. O arquivo pode ser uma imagem escaneada.');
                }

                const truncatedText = pdfText.slice(0, 8000);

                const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

                const groqPayload = {
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content:
                                'Você é um professor experiente. Leia o conteúdo do material abaixo e crie exercícios de múltipla escolha de alta qualidade. Responda APENAS com as questões, sem introduções ou despedidas.',
                        },
                        {
                            role: 'user',
                            content: `Com base no conteúdo abaixo, crie exatamente 5 questões de múltipla escolha (a, b, c, d).

        Formato OBRIGATÓRIO:

        Questão 1: <enunciado>
        a) <alternativa>
        b) <alternativa>
        c) <alternativa>
        d) <alternativa>
        Resposta: <letra correta>

        Questão 2: ...

        Conteúdo do material:
        ${truncatedText}`,
                        },
                    ],
                    temperature: 0.4,
                    max_tokens: 1800,
                };

                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${GROQ_API_KEY}`,
                    },
                    body: JSON.stringify(groqPayload),
                });

                if (!groqRes.ok) {
                    const errBody = await groqRes.json().catch(() => ({}));
                    throw new Error(errBody?.error?.message || `Erro Groq: ${groqRes.status}`);
                }

                const groqData = await groqRes.json();
                const rawText = groqData.choices?.[0]?.message?.content || '';

                if (!rawText.trim()) throw new Error('A IA não retornou conteúdo. Tente novamente.');

                const parsed = parseQuestions(rawText);
                if (parsed.length === 0) throw new Error('Não foi possível interpretar as questões geradas.');

                setQuestions(parsed);
                setGenerated(true);
            } catch (err) {
                setError(err.message || 'Ocorreu um erro inesperado.');
            } finally {
                setLoading(false);
            }
        }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIcon}>
                            <i className="fa-solid fa-robot"></i>
                        </div>
                        <div>
                            <h2 className={styles.title}>Exercícios com IA</h2>
                            <p className={styles.subtitle}>{material?.nome}</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className={styles.body}>

                    {!loading && !generated && !error && (
                        <div className={styles.loadingState}>
                            <i className="fa-solid fa-file-circle-question"
                               style={{ fontSize: '2.8rem', color: 'var(--brand-primary)' }}></i>
                            <p className={styles.loadingLabel}>Pronto para gerar exercícios</p>
                            <p className={styles.loadingHint}>
                                A IA irá analisar o PDF "{material?.nome}" e criar 5 questões de múltipla escolha.
                            </p>
                            <Button onClick={handleGenerate} style={{ marginTop: '8px' }}>
                                <i className="fa-solid fa-wand-magic-sparkles"></i> Gerar Exercícios
                            </Button>
                        </div>
                    )}

                    {loading && (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p className={styles.loadingLabel}>Analisando o PDF...</p>
                            <p className={styles.loadingHint}>A IA está lendo o material e criando as questões. Aguarde.</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className={styles.errorState}>
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <p className={styles.errorTitle}>Não foi possível gerar os exercícios</p>
                            <p className={styles.errorMsg}>{error}</p>
                            <Button onClick={handleGenerate} style={{ marginTop: '4px' }}>
                                <i className="fa-solid fa-rotate-right"></i> Tentar Novamente
                            </Button>
                        </div>
                    )}

                    {!loading && generated && questions.length > 0 && (
                        <>
                            {questions.map(q => (
                                <div key={q.id} className={styles.questionCard}>
                                    <div className={styles.questionHeader}>
                                        <span className={styles.questionBadge}>Q{q.id}</span>
                                        <p className={styles.questionText}>{q.text}</p>
                                    </div>

                                    {q.options.length > 0 && (
                                        <ul className={styles.optionsList}>
                                            {q.options.map(opt => (
                                                <li
                                                    key={opt.letter}
                                                    className={styles.optionItem}
                                                    style={
                                                        showAnswers && q.answer === opt.letter
                                                            ? { borderColor: '#27ae60', backgroundColor: 'rgba(39,174,96,0.07)' }
                                                            : {}
                                                    }
                                                >
                                                    <span className={styles.optionLetter}>{opt.letter})</span>
                                                    <span>{opt.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {showAnswers && q.answer && (
                                        <div className={styles.answerReveal}>
                                            <i className="fa-solid fa-circle-check"></i>
                                            Resposta correta: alternativa {q.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {!loading && (generated || error) && (
                    <div className={styles.footer}>
                        <span className={styles.footerInfo}>
                            {generated
                                ? <><i className="fa-solid fa-circle-check" style={{ color: '#27ae60' }}></i> {questions.length} questões geradas</>
                                : <><i className="fa-solid fa-triangle-exclamation" style={{ color: '#f39c12' }}></i> Erro na geração</>
                            }
                        </span>
                        <div className={styles.footerActions}>
                            {generated && (
                                <button
                                    className={styles.toggleAnswersBtn}
                                    onClick={() => setShowAnswers(v => !v)}
                                >
                                    <i className={`fa-solid ${showAnswers ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    {showAnswers ? 'Ocultar gabarito' : 'Ver gabarito'}
                                </button>
                            )}
                            <Button onClick={handleGenerate}>
                                <i className="fa-solid fa-rotate-right"></i> Regerar
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}