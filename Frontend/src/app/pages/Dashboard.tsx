import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, FileText, Filter, Trash2 } from 'lucide-react';
import { gestaoApi } from '../services/gestaoApi';
import { ingestaoApi } from '../services/ingestaoApi';
import type { Projeto, Arquivo } from '../types';
import { formatFileSize, formatDate, getFileIcon } from '../utils/format';
import { toast } from 'sonner';

export default function Dashboard() {
  const { projetoId } = useParams<{ projetoId: string }>();
  const navigate = useNavigate();

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [filteredArquivos, setFilteredArquivos] = useState<Arquivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (projetoId) {
      loadDashboardData();
    }
  }, [projetoId]);

  useEffect(() => {
    applyFilter();
  }, [arquivos, selectedFilter]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [projetoData, arquivosData] = await Promise.all([
        gestaoApi.getProjetoById(Number(projetoId)),
        ingestaoApi.getArquivosPorProjeto(Number(projetoId)),
      ]);

      if (!projetoData) {
        toast.error('Projeto não encontrado');
        navigate('/');
        return;
      }

      setProjeto(projetoData);
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
    if (selectedFilter === 'all') {
      setFilteredArquivos(arquivos);
    } else {
      setFilteredArquivos(arquivos.filter((arq) => arq.tipo === selectedFilter));
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map((file) =>
      ingestaoApi.uploadArquivo(Number(projetoId), file)
    );

    try {
      await Promise.all(uploadPromises);
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
      loadDashboardData();
    } catch (error) {
      toast.error('Erro ao enviar arquivos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, []);

  const handleDownload = async (arquivo: Arquivo) => {
    try {
      await ingestaoApi.downloadArquivo(
        arquivo.projeto_id,
        arquivo.id!,
        arquivo.nome_original
      );
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
    const types = new Set(arquivos.map((arq) => arq.tipo).filter(Boolean));
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

  if (!projeto) {
    return null;
  }

  const fileTypes = getUniqueFileTypes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
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
                {arquivos.length} arquivo{arquivos.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(arquivos.reduce((sum, arq) => sum + arq.tamanho_bytes, 0))} total
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div
          className={`mb-8 border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Formatos aceitos: PDF, TXT, DOCX, CSV</p>
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            accept=".pdf,.txt,.docx,.csv"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer transition-colors"
          >
            {isUploading ? 'Enviando...' : 'Selecionar Arquivos'}
          </label>
        </div>

        {fileTypes.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <Filter size={20} className="text-gray-500 dark:text-gray-400" />
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Todos ({arquivos.length})
            </button>
            {fileTypes.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setSelectedFilter(tipo)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === tipo
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {tipo.toUpperCase()} ({arquivos.filter((a) => a.tipo === tipo).length})
              </button>
            ))}
          </div>
        )}

        {filteredArquivos.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <FileText size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {selectedFilter === 'all' ? 'Nenhum arquivo encontrado' : `Nenhum arquivo ${selectedFilter.toUpperCase()}`}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedFilter === 'all'
                ? 'Faça upload de arquivos para começar'
                : 'Tente outro filtro ou faça upload de novos arquivos'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Arquivo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Tamanho</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Data</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredArquivos.map((arquivo) => (
                  <tr key={arquivo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(arquivo.tipo)}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{arquivo.nome_original}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium uppercase">
                        {arquivo.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatFileSize(arquivo.tamanho_bytes)}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatDate(arquivo.data_ingestao)}</td>
                    <td className="px-6 py-4 text-right">
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
    </div>
  );
}
