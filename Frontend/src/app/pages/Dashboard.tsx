import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, Download, FileText, Filter, Trash2, 
  Github, Folder, FolderPlus, Search, Book, GitBranch, GitPullRequest, Loader2, Database
} from 'lucide-react';
import { gestaoApi } from '../services/gestaoApi';
import { ingestaoApi } from '../services/ingestaoApi';
import { githubApi, GitHubRepo, GitHubBranch, GitHubPR } from '../services/githubApi';
import type { Projeto, Arquivo, Pasta } from '../types';
import { formatFileSize, formatDate, getFileIcon } from '../utils/format';
import { toast } from 'sonner';

export default function Dashboard() {
  const { projetoId } = useParams<{ projetoId: string }>();
  const navigate = useNavigate();

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [filteredArquivos, setFilteredArquivos] = useState<Arquivo[]>([]);
  const [currentPastaId, setCurrentPastaId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);

  // Folder Modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // GitHub Modal States
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [isSearchingRepos, setIsSearchingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [repoBranches, setRepoBranches] = useState<GitHubBranch[]>([]);
  const [repoPRs, setRepoPRs] = useState<GitHubPR[]>([]);
  const [isLoadingRepoDetails, setIsLoadingRepoDetails] = useState(false);

  useEffect(() => {
    if (projetoId) {
      loadDashboardData();
    }
  }, [projetoId]);

  useEffect(() => {
    applyFilter();
  }, [arquivos, selectedFilter, currentPastaId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [projetoData, arquivosData, pastasData] = await Promise.all([
        gestaoApi.getProjetoById(Number(projetoId)),
        ingestaoApi.getArquivosPorProjeto(Number(projetoId)),
        ingestaoApi.listarPastas(Number(projetoId))
      ]);

      if (!projetoData) {
        toast.error('Projeto não encontrado');
        navigate('/');
        return;
      }

      setProjeto(projetoData);
      setPastas(pastasData || []);
      
      const arquivosArray = Array.isArray(arquivosData) ? arquivosData : [];
      setArquivos(arquivosArray.sort((a, b) =>
        new Date(b.data_ingestao || 0).getTime() - new Date(a.data_ingestao || 0).getTime()
      ));
    } catch (error) {
      toast.error('Erro ao carregar dados do projeto');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = arquivos.filter(arq => 
      (arq.pasta_id === currentPastaId) || (!arq.pasta_id && currentPastaId === null)
    );

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((arq) => arq.tipo === selectedFilter);
    }
    setFilteredArquivos(filtered);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map((file) =>
      ingestaoApi.uploadArquivo(Number(projetoId), file)
    );

    try {
      const results = await Promise.all(uploadPromises);
      if (currentPastaId !== null) {
        const movePromises = results.map(res => ingestaoApi.moverArquivo(Number(projetoId), res.id, currentPastaId));
        await Promise.all(movePromises);
      }
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
      loadDashboardData();
    } catch (error) {
      toast.error('Erro ao processar arquivos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await ingestaoApi.criarPasta({ nome: newFolderName, projeto_id: Number(projetoId) });
      toast.success('Pasta criada com sucesso!');
      setNewFolderName('');
      setIsFolderModalOpen(false);
      loadDashboardData();
    } catch (error) {
      toast.error('Erro ao criar pasta');
    }
  };

  const handleFileDragStart = (e: React.DragEvent, arquivoId: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ arquivoId }));
  };

  const handleFolderDrop = async (e: React.DragEvent, pastaId: number | null) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data.arquivoId) return;

      await ingestaoApi.moverArquivo(Number(projetoId), data.arquivoId, pastaId);
      toast.success('Arquivo movido com sucesso!');
      loadDashboardData();
    } catch (error) {
      toast.error('Erro ao mover arquivo');
      loadDashboardData();
    }
  };

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [currentPastaId]);

  const handleDownload = async (arquivo: Arquivo) => {
    try {
      await ingestaoApi.downloadArquivo(arquivo.projeto_id, arquivo.id!, arquivo.nome_original);
      toast.success('Download iniciado!');
    } catch (error) {
      toast.error('Erro ao baixar arquivo');
    }
  };

  const handleDeleteArquivo = async (arquivo: Arquivo) => {
    if (window.confirm(`Deseja realmente excluir o arquivo "${arquivo.nome_original}"?`)) {
      try {
        await ingestaoApi.deleteArquivo(arquivo.projeto_id, arquivo.id!);
        toast.success('Arquivo excluído com sucesso!');
        loadDashboardData();
      } catch (error) {
        toast.error('Erro ao excluir arquivo');
      }
    }
  };

  const getUniqueFileTypes = () => {
    const types = new Set(arquivos.filter(arq => (arq.pasta_id === currentPastaId) || (!arq.pasta_id && currentPastaId === null)).map((arq) => arq.tipo).filter(Boolean));
    return Array.from(types) as string[];
  };

  // Funções de Integração com o GitHub
  const handleSearchGithubUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;

    setIsSearchingRepos(true);
    setSelectedRepo(null);
    try {
      const repos = await githubApi.listarRepositorios(githubUsername);
      setGithubRepos(repos);
      if (repos.length === 0) {
        toast.info('Nenhum repositório público encontrado.');
      }
    } catch (error) {
      toast.error('Erro ao buscar usuário no GitHub');
      setGithubRepos([]);
    } finally {
      setIsSearchingRepos(false);
    }
  };

  const handleSelectRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setIsLoadingRepoDetails(true);
    try {
      const [branches, prs] = await Promise.all([
        githubApi.listarBranches(githubUsername, repo.nome),
        githubApi.listarPRs(githubUsername, repo.nome)
      ]);
      setRepoBranches(branches);
      setRepoPRs(prs);
      if (branches.length > 0) {
        setSelectedBranch(branches[0].nome);
      }
    } catch (error) {
      toast.error(`Erro ao carregar detalhes do repositório ${repo.nome}`);
    } finally {
      setIsLoadingRepoDetails(false);
    }
  };

  const handleImportRepoData = async () => {
    if (!selectedRepo) return;
    
    setIsUploading(true);
    try {
      const payload = {
        owner: githubUsername,
        repo: selectedRepo.nome,
        projeto_id: Number(projetoId),
        branch: selectedBranch,
        token: githubToken || undefined
      };

      const result = await githubApi.importarRepositorio(payload);
      toast.success(result.mensagem || 'Importação iniciada em segundo plano!');
      setIsGithubModalOpen(false);
      
      // Inform the user that it might take a moment to see the files
      toast.info('Os arquivos aparecerão aqui assim que o processamento terminar.', { duration: 6000 });
      
    } catch (error) {
      toast.error('Erro ao solicitar importação do GitHub');
    } finally {
      setIsUploading(false);
    }
  };

  const resetGithubModal = () => {
    setIsGithubModalOpen(false);
    setGithubUsername('');
    setGithubToken('');
    setGithubRepos([]);
    setSelectedRepo(null);
    setSelectedBranch('main');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!projeto) return null;

  const fileTypes = getUniqueFileTypes();
  const currentPastaName = pastas.find(p => p.id === currentPastaId)?.nome;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para projetos
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{projeto.nome}</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{projeto.descricao || 'Sem descrição'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {arquivos.length} arquivo{arquivos.length !== 1 ? 's' : ''} total
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(arquivos.reduce((sum, arq) => sum + arq.tamanho_bytes, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {currentPastaId !== null ? (
              <div 
                className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                onClick={() => setCurrentPastaId(null)}
                onDragOver={handleFolderDragOver}
                onDrop={(e) => handleFolderDrop(e, null)}
                title="Arraste arquivos aqui para movê-los para a raiz"
              >
                <ArrowLeft size={18} />
                <span>Raiz</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Folder size={18} className="text-purple-500" />
                  {currentPastaName}
                </span>
              </div>
            ) : (
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Arquivos Raiz</h2>
            )}
          </div>
          
          <button 
            onClick={() => setIsFolderModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-zinc-800 hover:bg-gray-800 dark:hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <FolderPlus size={18} />
            Nova Pasta
          </button>
        </div>

        {currentPastaId === null && pastas.length > 0 && (
          <div className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pastas.map(pasta => (
                <div 
                  key={pasta.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all group"
                  onClick={() => setCurrentPastaId(pasta.id)}
                  onDragOver={handleFolderDragOver}
                  onDrop={(e) => handleFolderDrop(e, pasta.id)}
                  title="Clique para abrir, ou arraste arquivos para cá"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Folder className="text-purple-500 fill-purple-100 dark:fill-purple-900/50 flex-shrink-0" size={28} />
                    <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{pasta.nome}</span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-zinc-500 font-medium bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                    {arquivos.filter(a => a.pasta_id === pasta.id).length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zona de Upload */}
        <div
          className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 scale-[1.01]'
              : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-gray-400 dark:hover:border-zinc-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={40} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Formatos aceitos: PDF, TXT, DOCX, CSV</p>
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            accept=".pdf,.txt,.docx,.csv"
          />
          <div className="flex justify-center items-center gap-4">
            <label
              htmlFor="file-upload"
              className="inline-block px-5 py-2.5 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 cursor-pointer transition-colors font-medium shadow-sm"
            >
              {isUploading ? 'Enviando...' : 'Selecionar Arquivos'}
            </label>
            <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">ou</span>
            <button
              onClick={() => setIsGithubModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-zinc-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-zinc-700 transition-colors font-medium shadow-sm"
            >
              <Github size={18} />
              Importar do GitHub
            </button>
          </div>
        </div>

        {/* Filtros */}
        {fileTypes.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <Filter size={18} className="text-gray-500 dark:text-gray-400" />
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors font-medium ${
                selectedFilter === 'all'
                  ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700'
              }`}
            >
              Todos ({filteredArquivos.length})
            </button>
            {fileTypes.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setSelectedFilter(tipo)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors font-medium ${
                  selectedFilter === tipo
                    ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700'
                }`}
              >
                {tipo.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Tabela de Arquivos */}
        {filteredArquivos.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {selectedFilter === 'all' ? 'Nenhum arquivo nesta visualização' : `Nenhum arquivo ${selectedFilter.toUpperCase()}`}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Faça upload de arquivos ou mova-os para cá
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-zinc-800">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arquivo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tamanho</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {filteredArquivos.map((arquivo) => (
                  <tr 
                    key={arquivo.id} 
                    draggable
                    onDragStart={(e) => handleFileDragStart(e, arquivo.id!)}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-move group"
                    title="Você pode arrastar este arquivo para uma pasta"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(arquivo.tipo)}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{arquivo.nome_original}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-md text-xs font-bold uppercase tracking-wide">
                        {arquivo.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatFileSize(arquivo.tamanho_bytes)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(arquivo.data_ingestao)}</td>
                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownload(arquivo)}
                          className="inline-flex items-center justify-center p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                          title="Baixar"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteArquivo(arquivo)}
                          className="inline-flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Pasta */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg">
                <FolderPlus size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nova Pasta</h3>
            </div>
            <form onSubmit={handleCreateFolder}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da pasta
                </label>
                <input 
                  type="text" 
                  value={newFolderName} 
                  onChange={e => setNewFolderName(e.target.value)} 
                  placeholder="Ex: Documentos Financeiros" 
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-400"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsFolderModalOpen(false);
                    setNewFolderName('');
                  }} 
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!newFolderName.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal GitHub Importação */}
      {isGithubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl p-6 border border-gray-200 dark:border-zinc-800 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-lg">
                  <Github size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Importar do GitHub</h3>
              </div>
              <button 
                onClick={resetGithubModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
              {/* Passo 1: Buscar Usuário */}
              <form onSubmit={handleSearchGithubUser} className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome de Usuário (GitHub) *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        value={githubUsername} 
                        onChange={e => setGithubUsername(e.target.value)} 
                        placeholder="Ex: luanapavanelli" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-400"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSearchingRepos || !githubUsername.trim()}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2"
                    >
                      {isSearchingRepos ? <Loader2 size={18} className="animate-spin" /> : 'Buscar'}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
                    <span>Token do GitHub <span className="text-xs text-gray-500 font-normal">(opcional)</span></span>
                  </label>
                  <input 
                    type="password" 
                    value={githubToken} 
                    onChange={e => setGithubToken(e.target.value)} 
                    placeholder="ghp_..." 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-400 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Forneça um token se precisar baixar arquivos de repositórios privados.</p>
                </div>
              </form>

              {/* Passo 2: Listagem de Repositórios */}
              {!selectedRepo && githubRepos.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Repositórios Públicos ({githubRepos.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {githubRepos.map(repo => (
                      <div 
                        key={repo.nome}
                        onClick={() => handleSelectRepo(repo)}
                        className="p-4 border border-gray-200 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl cursor-pointer transition-all hover:shadow-md bg-white dark:bg-zinc-800/50 flex items-start gap-3 group"
                      >
                        <Book className="text-gray-400 group-hover:text-purple-500 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                            {repo.nome}
                          </p>
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded">
                            {repo.visibilidade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passo 3: Detalhes do Repositório Selecionado */}
              {selectedRepo && (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between mb-4 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50">
                    <div>
                      <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Repositório Selecionado</span>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {selectedRepo.nome}
                        <a href={selectedRepo.url} target="_blank" rel="noreferrer" className="text-purple-500 hover:text-purple-700">
                          <ExternalLinkIcon size={14} />
                        </a>
                      </h4>
                    </div>
                    <button 
                      onClick={() => setSelectedRepo(null)}
                      className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg"
                    >
                      Voltar à lista
                    </button>
                  </div>

                  {isLoadingRepoDetails ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <Loader2 size={32} className="animate-spin text-purple-500 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Extraindo dados do GitHub...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {/* Branches */}
                      <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/50">
                        <h5 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                          <GitBranch size={16} className="text-purple-500" />
                          Branches ({repoBranches.length})
                        </h5>
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                          {repoBranches.map(b => (
                            <li 
                              key={b.nome} 
                              onClick={() => setSelectedBranch(b.nome)}
                              className={`flex items-center gap-2 text-sm py-2 px-3 rounded-lg cursor-pointer transition-colors border ${
                                selectedBranch === b.nome 
                                  ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-medium' 
                                  : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${
                                selectedBranch === b.nome ? 'border-purple-500' : 'border-gray-300 dark:border-zinc-600'
                              }`}>
                                {selectedBranch === b.nome && <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />}
                              </div>
                              {b.nome}
                            </li>
                          ))}
                          {repoBranches.length === 0 && <li className="text-sm text-gray-400 italic px-2">Nenhuma branch</li>}
                        </ul>
                      </div>

                      {/* PRs */}
                      <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/50">
                        <h5 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                          <GitPullRequest size={16} className="text-purple-500" />
                          Pull Requests ({repoPRs.length})
                        </h5>
                        <ul className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                          {repoPRs.map(pr => (
                            <li key={pr.url} className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/80 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-700/50">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  pr.estado === 'open' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                }`}>
                                  {pr.estado}
                                </span>
                                <span className="text-xs text-gray-400">@{pr.autor}</span>
                              </div>
                              <p className="font-medium text-gray-900 dark:text-gray-200 line-clamp-1" title={pr.titulo}>{pr.titulo}</p>
                            </li>
                          ))}
                          {repoPRs.length === 0 && <li className="text-sm text-gray-400 italic">Nenhum Pull Request</li>}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button 
                type="button" 
                onClick={resetGithubModal}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                disabled={!selectedRepo || isLoadingRepoDetails || isUploading}
                onClick={handleImportRepoData}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
                {isUploading ? 'Processando...' : 'Importar Arquivos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExternalLinkIcon(props: { size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
}