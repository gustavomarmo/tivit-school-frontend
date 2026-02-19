import { useEffect, useState } from 'react';
import { getSubjectsList, getSubjectContent, addSubjectResource } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ResourceItem } from '../../components/ResourceItem';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Form/Input';
import { Select } from '../../components/Form/Select';
import styles from './Materias.module.css';

export function Materias() {
    const { userRole } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [modules, setModules] = useState([]);
    const [loadingContent, setLoadingContent] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newActivity, setNewActivity] = useState({
        moduleId: '',
        type: 'link',
        title: '',
        desc: '',
        url: ''
    });

    const [viewContent, setViewContent] = useState(null);

    useEffect(() => {
        getSubjectsList().then(data => {
            setSubjects(data);
            if (data.length > 0) setSelectedSubject(data[0]);
        });
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            carregarConteudo();
        }
    }, [selectedSubject]);

    function carregarConteudo() {
        setLoadingContent(true);
        getSubjectContent(selectedSubject).then(data => {
            setModules(data);
            if(data.length > 0) {
                setNewActivity(prev => ({...prev, moduleId: data[0].id}));
            }
            setLoadingContent(false);
        });
    }

    async function handleAddActivity(e) {
        e.preventDefault();
        if(!newActivity.title || !newActivity.url) return alert("Preencha título e link/arquivo");

        await addSubjectResource(selectedSubject, newActivity.moduleId, newActivity);
        
        alert("Atividade adicionada com sucesso!");
        setIsModalOpen(false);
        setNewActivity({...newActivity, title: '', desc: '', url: ''});
        carregarConteudo();
    }

    function handleOpenResource(item) {
        setViewContent(item);
    }

    return (
        <div className={styles.container}>
            <aside className={styles.sidebarList}>
                {subjects.map(subj => (
                    <div 
                        key={subj}
                        className={`${styles.subjectItem} ${selectedSubject === subj ? styles.activeSubject : ''}`}
                        onClick={() => setSelectedSubject(subj)}
                    >
                        <i className="fa-solid fa-book"></i> {subj}
                    </div>
                ))}
            </aside>

            <main className={styles.contentArea}>
                <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>{selectedSubject}</h1>
                    
                    {(userRole === 'professor' || userRole === 'coordenador') && (
                        <Button onClick={() => setIsModalOpen(true)}>
                            <i className="fa-solid fa-plus"></i> Nova Atividade
                        </Button>
                    )}
                </div>

                {loadingContent ? <p>Carregando...</p> : (
                    modules.map(module => (
                        <div key={module.id} className={styles.moduleBlock}>
                            <h3 className={styles.moduleTitle}>
                                <i className="fa-solid fa-caret-down"></i> {module.titulo}
                            </h3>
                            <div className={styles.resourcesList}>
                                {module.itens.map(item => (
                                    <ResourceItem 
                                        key={item.id}
                                        type={item.type}
                                        title={item.nome}
                                        desc={item.desc}
                                        status={item.status}
                                        onOpen={() => handleOpenResource(item)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Adicionar Nova Atividade"
            >
                <form onSubmit={handleAddActivity}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <Select 
                            label="Módulo"
                            value={newActivity.moduleId}
                            onChange={e => setNewActivity({...newActivity, moduleId: e.target.value})}
                        >
                            {modules.map(m => (
                                <option key={m.id} value={m.id}>{m.titulo}</option>
                            ))}
                        </Select>

                        <Select 
                            label="Tipo de Recurso"
                            value={newActivity.type}
                            onChange={e => setNewActivity({...newActivity, type: e.target.value})}
                        >
                            <option value="link">Vídeo / Link Externo</option>
                            <option value="file">Arquivo PDF / Doc</option>
                        </Select>

                        <Input 
                            label="Título da Atividade"
                            placeholder="Ex: Aula sobre Equações"
                            required
                            value={newActivity.title}
                            onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                        />

                        <Input 
                            label="Descrição Curta"
                            placeholder="Ex: Ler páginas 10 a 15"
                            value={newActivity.desc}
                            onChange={e => setNewActivity({...newActivity, desc: e.target.value})}
                        />

                        {newActivity.type === 'file' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{fontWeight:'bold', fontSize:'0.9rem'}}>Arquivo</label>
                                <input type="file" required onChange={e => setNewActivity({...newActivity, url: e.target.value})} />
                            </div>
                        ) : (
                            <Input 
                                label="URL do Link / Vídeo"
                                placeholder="https://..."
                                type="url"
                                required
                                value={newActivity.url}
                                onChange={e => setNewActivity({...newActivity, url: e.target.value})}
                            />
                        )}

                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit">
                                <i className="fa-solid fa-check"></i> Adicionar
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>
            {viewContent && (
                <Modal 
                    isOpen={!!viewContent} 
                    onClose={() => setViewContent(null)} 
                    title={viewContent.nome}
                >
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <i 
                            className={`fa-solid ${
                                viewContent.type === 'link' ? 'fa-video' : 
                                viewContent.type === 'file' ? 'fa-file-pdf' : 'fa-clipboard-list'
                            }`} 
                            style={{ fontSize: '4rem', color: 'var(--brand-primary)', marginBottom: '20px' }}
                        ></i>

                        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                            {viewContent.desc}
                        </p>

                        {viewContent.type === 'link' ? (
                            <Button onClick={() => window.open(viewContent.url, '_blank')}>
                                <i className="fa-solid fa-external-link"></i> Acessar Conteúdo
                            </Button>
                        ) : viewContent.type === 'file' ? (
                            <Button onClick={() => alert('Download iniciado...')}>
                                <i className="fa-solid fa-download"></i> Baixar Arquivo
                            </Button>
                        ) : (
                            <div style={{ backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8 }}>
                                <strong>Status:</strong> {viewContent.status || 'Pendente'}
                                <br/><br/>
                                <Button>Enviar Resposta</Button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}