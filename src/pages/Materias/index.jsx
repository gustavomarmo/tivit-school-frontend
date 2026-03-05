import { useEffect, useState } from 'react';
import {
    getSubjectsList,
    getSubjectContent,
    addSubjectResource,
    addTopicToSubject,
    deleteTopicFromSubject,
    editTopicFromSubject,
    deleteMaterialFromSubject,
    editMaterialFromSubject,
} from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useDialog } from '../../contexts/DialogContext';
import { ResourceItem } from '../../components/ResourceItem';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Form/Input';
import { Select } from '../../components/Form/Select';
import { ExerciciosModal } from '../../components/ExerciciosModal';
import styles from './Materias.module.css';

export function Materias() {
    const { user, userRole } = useAuth();
    const { toast, confirm } = useDialog();
    const isProfessor = userRole === 'professor' || userRole === 'coordenador';

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [modules, setModules] = useState([]);
    const [loadingContent, setLoadingContent] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newActivity, setNewActivity] = useState({ moduleId: '', type: 'link', title: '', desc: '', url: '' });

    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [savingTopic, setSavingTopic] = useState(false);

    const [editingTopic, setEditingTopic] = useState(null);
    const [editTopicTitle, setEditTopicTitle] = useState('');
    const [savingEditTopic, setSavingEditTopic] = useState(false);

    const [editingItem, setEditingItem] = useState(null);
    const [editItemData, setEditItemData] = useState({ nome: '', desc: '', url: '', type: 'link' });
    const [savingEditItem, setSavingEditItem] = useState(false);

    const [viewContent, setViewContent] = useState(null);

    const [exerciciosItem, setExerciciosItem] = useState(null);

    useEffect(() => {
        getSubjectsList().then(data => {
            setSubjects(data);
            if (data.length > 0) setSelectedSubject(data[0]);
        });
    }, []);

    useEffect(() => {
        if (selectedSubject) carregarConteudo();
    }, [selectedSubject]);

    function carregarConteudo() {
        setLoadingContent(true);
        getSubjectContent(selectedSubject, user.role).then(data => {
            setModules(data);
            if (data.length > 0) setNewActivity(prev => ({ ...prev, moduleId: data[0].id }));
            setLoadingContent(false);
        });
    }

    async function handleAddActivity(e) {
        e.preventDefault();
        if (!newActivity.title || !newActivity.url) {
            toast('Preencha o título e o link/arquivo.', 'warning');
            return;
        }
        await addSubjectResource(newActivity.moduleId, newActivity);
        toast('Atividade adicionada com sucesso!', 'success');
        setIsModalOpen(false);
        setNewActivity({ ...newActivity, title: '', desc: '', url: '' });
        carregarConteudo();
    }

    async function handleAddTopic(e) {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;
        setSavingTopic(true);
        try {
            await addTopicToSubject(selectedSubject, newTopicTitle.trim());
            toast('Tópico criado com sucesso!', 'success');
            setIsTopicModalOpen(false);
            setNewTopicTitle('');
            carregarConteudo();
        } catch (err) {
            console.error(err);
            toast('Erro ao criar tópico. Tente novamente.', 'error');
        } finally {
            setSavingTopic(false);
        }
    }

    async function handleDeleteTopic(module) {
        const ok = await confirm(`Deletar o tópico "${module.titulo}" e todo seu conteúdo?`);
        if (!ok) return;
        await deleteTopicFromSubject(module.id);
        toast('Tópico removido.', 'success');
        carregarConteudo();
    }

    function openEditTopic(topic) {
        setEditingTopic(topic);
        setEditTopicTitle(topic.titulo);
    }

    async function handleEditTopic(e) {
        e.preventDefault();
        if (!editTopicTitle.trim()) return;
        setSavingEditTopic(true);
        try {
            await editTopicFromSubject(editingTopic.id, editTopicTitle.trim());
            toast('Tópico atualizado!', 'success');
            setEditingTopic(null);
            carregarConteudo();
        } catch (err) {
            console.error(err);
            toast('Erro ao editar tópico.', 'error');
        } finally {
            setSavingEditTopic(false);
        }
    }

    async function handleDeleteItem(topicId, item) {
        const ok = await confirm(`Deletar a atividade "${item.nome}"?`);
        if (!ok) return;
        await deleteMaterialFromSubject(item.id);
        toast('Atividade removida.', 'success');
        carregarConteudo();
    }

    function openEditItem(topicId, item) {
        setEditingItem({ topicId, item });
        setEditItemData({ nome: item.nome, desc: item.desc || '', url: item.url || '', type: item.type });
    }

    async function handleEditItem(e) {
        e.preventDefault();
        if (!editItemData.nome.trim()) return;
        setSavingEditItem(true);
        try {
            await editMaterialFromSubject(editingItem.item.id, editItemData);
            toast('Atividade atualizada!', 'success');
            setEditingItem(null);
            carregarConteudo();
        } catch (err) {
            console.error(err);
            toast('Erro ao editar atividade.', 'error');
        } finally {
            setSavingEditItem(false);
        }
    }

    function isPdfItem(item) {
        if (item.type !== 'file') return false;
        const urlLower = (item.url || '').toLowerCase();
        const nameLower = (item.nome || '').toLowerCase();
        return urlLower.endsWith('.pdf') || nameLower.endsWith('.pdf');
    }

    return (
        <div className={styles.container}>
            <aside className={styles.sidebarList}>
                {subjects.map(subj => (
                    <div
                        key={subj.id}
                        className={`${styles.subjectItem} ${selectedSubject?.id === subj.id ? styles.activeSubject : ''}`}
                        onClick={() => setSelectedSubject(subj)}
                    >
                        <i className="fa-solid fa-book"></i> {subj.nome}
                    </div>
                ))}
            </aside>

            <main className={styles.contentArea}>
                <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>{selectedSubject?.nome}</h1>
                    
                    {selectedSubject?.professor && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--icon-inactive)', margin: '4px 0 0' }}>
                            <i className="fa-solid fa-chalkboard-user" style={{ marginRight: 6 }}></i>
                            {selectedSubject.professor} — {selectedSubject.turma}
                        </p>
                    )}

                    {isProfessor && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button
                                variant="secondary"
                                onClick={() => setIsTopicModalOpen(true)}
                                style={{ border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', background: 'transparent' }}
                            >
                                <i className="fa-solid fa-folder-plus"></i> Novo Tópico
                            </Button>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <i className="fa-solid fa-plus"></i> Nova Atividade
                            </Button>
                        </div>
                    )}
                </div>

                {loadingContent ? <p>Carregando...</p> : (
                    modules.length === 0 ? (
                        <p style={{ color: 'var(--icon-inactive)', marginTop: '40px', textAlign: 'center' }}>
                            <i className="fa-solid fa-folder-open" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                            Nenhum tópico criado ainda.
                        </p>
                    ) : (
                        modules.map(module => (
                            <div key={module.id} className={styles.moduleBlock}>
                                <h3 className={styles.moduleTitle}>
                                    <i className="fa-solid fa-caret-down"></i>
                                    <span>{module.titulo}</span>

                                    {isProfessor && (
                                        <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '8px' }}>
                                            <IconButton icon="fa-pen" title="Editar tópico" onClick={() => openEditTopic(module)} />
                                            <IconButton icon="fa-trash" title="Deletar tópico" variant="danger" onClick={() => handleDeleteTopic(module)} />
                                        </span>
                                    )}
                                </h3>

                                <div className={styles.resourcesList}>
                                    {module.itens.length === 0 ? (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--icon-inactive)', paddingLeft: '10px' }}>
                                            Nenhum material neste tópico.
                                        </p>
                                    ) : (
                                        module.itens.map(item => (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <ResourceItem
                                                        type={item.type}
                                                        title={item.nome}
                                                        desc={item.desc}
                                                        status={item.status}
                                                        onOpen={() => setViewContent(item)}
                                                    />
                                                </div>

                                                <div
                                                    title={
                                                        !isPdfItem(item)
                                                            ? 'Disponível apenas para arquivos PDF'
                                                            : 'Criar exercícios com IA'
                                                    }
                                                    style={{ flexShrink: 0 }}
                                                >
                                                    <IconButton
                                                        icon="fa-robot"
                                                        title={
                                                            !isPdfItem(item)
                                                                ? 'Disponível apenas para arquivos PDF'
                                                                : 'Criar Exercícios com IA'
                                                        }
                                                        variant="success"
                                                        disabled={!isPdfItem(item)}
                                                        onClick={() => setExerciciosItem(item)}
                                                        style={
                                                            !isPdfItem(item)
                                                                ? { opacity: 0.35, cursor: 'not-allowed' }
                                                                : {}
                                                        }
                                                    />
                                                </div>

                                                {isProfessor && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                                                        <IconButton icon="fa-pen" title="Editar atividade" onClick={() => openEditItem(module.id, item)} />
                                                        <IconButton icon="fa-trash" title="Deletar atividade" variant="danger" onClick={() => handleDeleteItem(module.id, item)} />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))
                    )
                )}
            </main>

            <ExerciciosModal
                isOpen={!!exerciciosItem}
                onClose={() => setExerciciosItem(null)}
                material={exerciciosItem}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Nova Atividade">
                <form onSubmit={handleAddActivity}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <Select label="Módulo" value={newActivity.moduleId} onChange={e => setNewActivity({ ...newActivity, moduleId: e.target.value })}>
                            {modules.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                        </Select>
                        <Select label="Tipo de Recurso" value={newActivity.type} onChange={e => setNewActivity({ ...newActivity, type: e.target.value })}>
                            <option value="link">Vídeo / Link Externo</option>
                            <option value="file">Arquivo PDF / Doc</option>
                            <option value="assignment">Atividade / Tarefa</option>
                        </Select>
                        <Input label="Título" placeholder="Ex: Aula sobre Equações" required value={newActivity.title} onChange={e => setNewActivity({ ...newActivity, title: e.target.value })} />
                        <Input label="Descrição Curta" placeholder="Ex: Ler páginas 10 a 15" value={newActivity.desc} onChange={e => setNewActivity({ ...newActivity, desc: e.target.value })} />
                        {newActivity.type === 'file' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Arquivo</label>
                                <input type="file" required onChange={e => setNewActivity({ ...newActivity, url: e.target.value })} />
                            </div>
                        ) : (
                            <Input label="URL do Link / Vídeo" placeholder="https://..." type="url" required value={newActivity.url} onChange={e => setNewActivity({ ...newActivity, url: e.target.value })} />
                        )}
                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit"><i className="fa-solid fa-check"></i> Adicionar</Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTopicModalOpen} onClose={() => { setIsTopicModalOpen(false); setNewTopicTitle(''); }} title="Criar Novo Tópico">
                <form onSubmit={handleAddTopic}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <Input label="Título do Tópico" placeholder="Ex: 1º Bimestre: Introdução à Álgebra" required autoFocus value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <Button type="button" variant="icon" onClick={() => { setIsTopicModalOpen(false); setNewTopicTitle(''); }}>Cancelar</Button>
                            <Button type="submit" disabled={savingTopic}>
                                <i className="fa-solid fa-folder-plus"></i>
                                {savingTopic ? 'Criando...' : 'Criar Tópico'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!editingTopic} onClose={() => setEditingTopic(null)} title="Editar Tópico">
                <form onSubmit={handleEditTopic}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <Input label="Título do Tópico" required autoFocus value={editTopicTitle} onChange={e => setEditTopicTitle(e.target.value)} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <Button type="button" variant="icon" onClick={() => setEditingTopic(null)}>Cancelar</Button>
                            <Button type="submit" disabled={savingEditTopic}>
                                <i className="fa-solid fa-pen"></i>
                                {savingEditTopic ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Editar Atividade">
                <form onSubmit={handleEditItem}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <Select label="Tipo de Recurso" value={editItemData.type} onChange={e => setEditItemData({ ...editItemData, type: e.target.value })}>
                            <option value="link">Vídeo / Link Externo</option>
                            <option value="file">Arquivo PDF / Doc</option>
                            <option value="assignment">Atividade / Tarefa</option>
                        </Select>
                        <Input label="Título" required value={editItemData.nome} onChange={e => setEditItemData({ ...editItemData, nome: e.target.value })} />
                        <Input label="Descrição" value={editItemData.desc} onChange={e => setEditItemData({ ...editItemData, desc: e.target.value })} />
                        <Input label="URL / Link" type="url" value={editItemData.url} onChange={e => setEditItemData({ ...editItemData, url: e.target.value })} placeholder="https://..." />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <Button type="button" variant="icon" onClick={() => setEditingItem(null)}>Cancelar</Button>
                            <Button type="submit" disabled={savingEditItem}>
                                <i className="fa-solid fa-pen"></i>
                                {savingEditItem ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {viewContent && (
                <Modal isOpen={!!viewContent} onClose={() => setViewContent(null)} title={viewContent.nome}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <i
                            className={`fa-solid ${viewContent.type === 'link' ? 'fa-video' : viewContent.type === 'file' ? 'fa-file-pdf' : 'fa-clipboard-list'}`}
                            style={{ fontSize: '4rem', color: 'var(--brand-primary)', marginBottom: '20px' }}
                        />
                        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{viewContent.desc}</p>
                        {viewContent.type === 'link' ? (
                            <Button onClick={() => window.open(viewContent.url, '_blank')}>
                                <i className="fa-solid fa-external-link"></i> Acessar Conteúdo
                            </Button>
                        ) : viewContent.type === 'file' ? (
                            <Button onClick={() => toast('Download iniciado!', 'info')}>
                                <i className="fa-solid fa-download"></i> Baixar Arquivo
                            </Button>
                        ) : (
                            <div style={{ backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8 }}>
                                <strong>Status:</strong> {viewContent.status || 'Pendente'}
                                <br /><br />
                                <Button>Enviar Resposta</Button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}