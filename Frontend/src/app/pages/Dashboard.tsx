import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, FileText, Filter, Trash2, Github, Folder, FolderPlus } from 'lucide-react';
import { gestaoApi } from '../services/gestaoApi';
import { ingestaoApi } from '../services/ingestaoApi';
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
      setPastas(pastasData);
      setArquivos(arquivosData.sort((a, b) =>
        new Date(b.data_ingestao || 0).getTime() - new Date(a.data_ingestao || 0).getTime()
      ));
    } catch (error) {
      toast.error('Erro ao carregar dados do projeto');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    // Filtrar apenas arquivos da pasta atual (ou raiz se null)
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
      // Move them to current folder if we are inside a folder
      if (currentPastaId !== null) {
        const movePromises = results.map(res => ingestaoApi.moverArquivo(res.id, currentPastaId));
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

  // Drag and Drop (Files -> Folders)
  const handleFileDragStart = (e: React.DragEvent, arquivoId: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ arquivoId }));
  };

  const handleFolderDrop = async (e: React.DragEvent, pastaId: number | null) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data.arquivoId) return;

      await ingestaoApi.moverArquivo(data.arquivoId, pastaId);
      toast.success('Arquivo movido com sucesso!');
      loadDashboardData();
    } catch (error) {
      toast.error('Erro ao mover arquivo');
    }
  };

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Drag and Drop (Files from OS)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragging state if it contains files from OS
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

  const handleImportFromGitHub = async () => {
    const MICROSERVICO_GITHUB_URL = "https://sua-url-da-azure.azurewebsites.net"; 
    toast.info('Integração com o microsserviço do GitHub será ativada após o deploy na Azure!', { duration: 5000 });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!projeto) return null;

  const fileTypes = getUniqueFileTypes();
  const currentPastaName = pastas.find(p => p.id === currentPastaId)?.nome;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
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
        
        {/* Header / Breadcrumb da Visualização Atual */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {currentPastaId !== null ? (
              <div 
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                onClick={() => setCurrentPastaId(null)}
                onDragOver={handleFolderDragOver}
                onDrop={(e) => handleFolderDrop(e, null)}
                title="Arraste arquivos aqui para movê-los para a raiz"
              >
                <ArrowLeft size={18} />
                <span>Raiz</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Folder size={18} className="text-blue-500" />
                  {currentPastaName}
                </span>
              </div>
            ) : (
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Arquivos Raiz</h2>
            )}
          </div>
          
          <button 
            onClick={() => setIsFolderModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <FolderPlus size={18} />
            Nova Pasta
          </button>
        </div>

        {/* Listagem de Pastas (Mostrada apenas na Raiz) */}
        {currentPastaId === null && pastas.length > 0 && (
          <div className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pastas.map(pasta => (
                <div 
                  key={pasta.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                  onClick={() => setCurrentPastaId(pasta.id)}
                  onDragOver={handleFolderDragOver}
                  onDrop={(e) => handleFolderDrop(e, pasta.id)}
                  title="Clique para abrir, ou arraste arquivos para cá"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Folder className="text-blue-500 fill-blue-100 dark:fill-blue-900/50 flex-shrink-0" size={28} />
                    <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{pasta.nome}</span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
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
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 scale-[1.01]'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
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
              className="inline-block px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer transition-colors font-medium shadow-sm"
            >
              {isUploading ? 'Enviando...' : 'Selecionar Arquivos'}
            </label>
            <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">ou</span>
            <button
              onClick={handleImportFromGitHub}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium shadow-sm"
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
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
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
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {tipo.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Tabela de Arquivos */}
        {filteredArquivos.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {selectedFilter === 'all' ? 'Nenhum arquivo nesta visualização' : `Nenhum arquivo ${selectedFilter.toUpperCase()}`}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Faça upload de arquivos ou mova-os para cá
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arquivo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tamanho</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredArquivos.map((arquivo) => (
                  <tr 
                    key={arquivo.id} 
                    draggable
                    onDragStart={(e) => handleFileDragStart(e, arquivo.id!)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-move group"
                    title="Você pode arrastar este arquivo para uma pasta"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(arquivo.tipo)}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{arquivo.nome_original}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs font-bold uppercase tracking-wide">
                        {arquivo.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatFileSize(arquivo.tamanho_bytes)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(arquivo.data_ingestao)}</td>
                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownload(arquivo)}
                          className="inline-flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
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
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsFolderModalOpen(false);
                    setNewFolderName('');
                  }} 
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!newFolderName.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
