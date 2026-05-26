import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { gestaoApi } from '../services/gestaoApi';
import type { Projeto, ProjetoCreate } from '../types';
import { formatDate } from '../utils/format';
import { toast } from 'sonner';

export default function Projects() {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentProject, setCurrentProject] = useState<ProjetoCreate>({
    nome: '',
    descricao: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadProjetos();
  }, []);

  const loadProjetos = async () => {
    setIsLoading(true);
    try {
      const data = await gestaoApi.getProjetos();
      setProjetos(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Erro ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', projeto?: Projeto) => {
    setModalMode(mode);
    if (mode === 'edit' && projeto) {
      setCurrentProject({
        nome: projeto.nome,
        descricao: projeto.descricao || '',
      });
      setEditingId(projeto.id || null);
    } else {
      setCurrentProject({ nome: '', descricao: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProject({ nome: '', descricao: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProject.nome.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    try {
      if (modalMode === 'create') {
        await gestaoApi.createProjeto(currentProject);
        toast.success('Projeto criado com sucesso!');
      } else if (editingId) {
        await gestaoApi.updateProjeto(editingId, currentProject);
        toast.success('Projeto atualizado com sucesso!');
      }

      handleCloseModal();
      loadProjetos();
    } catch (error) {
      toast.error(`Erro ao ${modalMode === 'create' ? 'criar' : 'atualizar'} projeto`);
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (window.confirm(`Deseja realmente excluir o projeto "${nome}"?`)) {
      try {
        await gestaoApi.deleteProjeto(id);
        toast.success('Projeto excluído com sucesso!');
        loadProjetos();
      } catch (error) {
        toast.error('Erro ao excluir projeto');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meus Projetos</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie seus projetos de ingestão de arquivos</p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Novo Projeto
          </button>
        </div>

        {projetos.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <FolderOpen size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Nenhum projeto encontrado</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Crie seu primeiro projeto para começar</p>
            <button
              onClick={() => handleOpenModal('create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} />
              Criar Projeto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projetos.map((projeto) => (
              <div
                key={projeto.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 cursor-pointer border border-gray-100 dark:border-gray-700 group"
                onClick={() => navigate(`/dashboard/${projeto.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {projeto.nome}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Criado {formatDate(projeto.data_criacao)}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal('edit', projeto);
                      }}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(projeto.id!, projeto.nome);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                  {projeto.descricao || 'Sem descrição'}
                </p>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Atualizado {formatDate(projeto.ultima_alteracao)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {modalMode === 'create' ? 'Novo Projeto' : 'Editar Projeto'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  value={currentProject.nome}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, nome: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Digite o nome do projeto"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={currentProject.descricao}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, descricao: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Descrição opcional do projeto"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  {modalMode === 'create' ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
