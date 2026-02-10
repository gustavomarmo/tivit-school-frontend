import { useEffect, useState } from 'react';
import { getSubjectsList, getSubjectContent } from '../../services/api';
import { ResourceItem } from '../../components/ResourceItem';
import { Card } from '../../components/Card';
import styles from './Materias.module.css';

export function Materias() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [modules, setModules] = useState([]);
    const [loadingContent, setLoadingContent] = useState(false);

    useEffect(() => {
        getSubjectsList().then(data => {
            setSubjects(data);
            if (data.length > 0) {
                setSelectedSubject(data[0]);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            setLoadingContent(true);
            getSubjectContent(selectedSubject).then(data => {
                setModules(data);
                setLoadingContent(false);
            });
        }
    }, [selectedSubject]);

    return (
        <div className={styles.container}>
            
            <aside className={styles.sidebarList}>
                {subjects.map(subj => (
                    <div 
                        key={subj}
                        className={`
                            ${styles.subjectItem} 
                            ${selectedSubject === subj ? styles.activeSubject : ''}
                        `}
                        onClick={() => setSelectedSubject(subj)}
                    >
                        <i className="fa-solid fa-book"></i>
                        {subj}
                    </div>
                ))}
            </aside>

            <main className={styles.contentArea}>
                <div className={styles.header}>
                    <h1>{selectedSubject}</h1>
                </div>

                {loadingContent ? (
                    <p>Carregando conteúdo...</p>
                ) : (
                    modules.map(module => (
                        <div key={module.id} className={styles.moduleBlock}>
                            <h3 className={styles.moduleTitle}>
                                <i className="fa-solid fa-caret-down"></i>
                                {module.titulo}
                            </h3>
                            
                            <div className={styles.resourcesList}>
                                {module.itens.map(item => (
                                    <ResourceItem 
                                        key={item.id}
                                        type={item.type}
                                        title={item.nome}
                                        desc={item.desc}
                                        status={item.status}
                                        onOpen={() => alert(`Abrindo: ${item.nome}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
                
                {!loadingContent && modules.length === 0 && (
                    <Card>
                        <p style={{textAlign:'center', color:'#888'}}>
                            Nenhum conteúdo disponível para esta matéria ainda.
                        </p>
                    </Card>
                )}
            </main>
        </div>
    );
}