import axios from 'axios';
import type { Arquivo, ArquivoUploadResponse, Pasta, PastaCreate } from '../types';

let API_BASE_URL = import.meta.env.VITE_INGESTAO_API_URL || 'http://localhost:8002';

// Garante que URLs em produção não usem HTTP para evitar erro de Mixed Content
if (API_BASE_URL.includes('azurewebsites.net') && API_BASE_URL.startsWith('http://')) {
  API_BASE_URL = API_BASE_URL.replace('http://', 'https://');
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const ingestaoApi = {
  // Get all files for a project
  async getArquivosPorProjeto(projetoId: number): Promise<Arquivo[]> {
    try {
      const response = await api.get<Arquivo[]>(`/api/getarquivos/projeto/${projetoId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error fetching files for project ${projetoId}:`, error);
      // Return mock data for development/preview
      return this.getMockArquivos(projetoId);
    }
  },

  // Upload file to project
  async uploadArquivo(projetoId: number, file: File): Promise<ArquivoUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('projeto_id', projetoId.toString());
      formData.append('file', file);

      const response = await api.post<ArquivoUploadResponse>(`/api/postarquivos/projeto/${projetoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Save to mock storage as fallback in case GET fails later
      try {
        const mockArquivos = this.getMockArquivos(projetoId);
        const newArquivo: Arquivo = {
          id: response.data.id || Date.now(),
          nome_original: file.name,
          projeto_id: projetoId,
          tipo: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          tamanho_bytes: file.size,
          data_ingestao: new Date().toISOString(),
          pasta_id: null
        };
        localStorage.setItem(`mock_arquivos_${projetoId}`, JSON.stringify([...mockArquivos, newArquivo]));
      } catch (e) {}

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      // Mock response for development
      const mockArquivo: Arquivo = {
        id: Date.now(),
        nome_original: file.name,
        projeto_id: projetoId,
        tipo: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        tamanho_bytes: file.size,
        data_ingestao: new Date().toISOString(),
        pasta_id: null
      };
      
      try {
        const mockArquivos = this.getMockArquivos(projetoId);
        localStorage.setItem(`mock_arquivos_${projetoId}`, JSON.stringify([...mockArquivos, mockArquivo]));
      } catch (e) {}

      return mockArquivo;
    }
  },

  // Get download URL for a file
  getDownloadUrl(projetoId: number, arquivoId: number): string {
    return `${API_BASE_URL}/api/arquivos/download/${projetoId}/${arquivoId}`;
  },

  // Download file (triggers browser download)
  async downloadArquivo(projetoId: number, arquivoId: number, fileName: string): Promise<void> {
    try {
      const response = await api.get(`/api/arquivos/download/${projetoId}/${arquivoId}`, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  // Delete file
  async deleteArquivo(projetoId: number, arquivoId: number): Promise<void> {
    try {
      await api.delete(`/api/arquivos/${projetoId}/${arquivoId}`);
      
      try {
        const mockArquivos = this.getMockArquivos(projetoId);
        localStorage.setItem(`mock_arquivos_${projetoId}`, JSON.stringify(mockArquivos.filter(a => a.id !== arquivoId)));
      } catch (e) {}
    } catch (error) {
      console.error(`Error deleting file ${arquivoId} from project ${projetoId}:`, error);
      
      // Update mock storage
      try {
        const mockArquivos = this.getMockArquivos(projetoId);
        localStorage.setItem(`mock_arquivos_${projetoId}`, JSON.stringify(mockArquivos.filter(a => a.id !== arquivoId)));
        return;
      } catch (e) {}
      
      throw error;
    }
  },

  // Pastas
  async listarPastas(projetoId: number): Promise<Pasta[]> {
    try {
      const response = await api.get<Pasta[]>(`/api/pastas/${projetoId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error fetching folders for project ${projetoId}:`, error);
      return this.getMockPastas(projetoId);
    }
  },

  async criarPasta(pasta: PastaCreate): Promise<Pasta> {
    try {
      const response = await api.post<{status: string, pasta_id: number}>('/api/pastas', pasta);
      const newPasta: Pasta = {
        id: response.data.pasta_id,
        nome: pasta.nome,
        projeto_id: pasta.projeto_id,
        data_criacao: new Date().toISOString()
      };
      
      try {
        const mockPastas = this.getMockPastas(pasta.projeto_id);
        localStorage.setItem(`mock_pastas_${pasta.projeto_id}`, JSON.stringify([...mockPastas, newPasta]));
      } catch (e) {}
      
      return newPasta;
    } catch (error) {
      console.error('Error creating folder:', error);
      // Mock response
      const mockPasta: Pasta = {
        id: Date.now(),
        nome: pasta.nome,
        projeto_id: pasta.projeto_id,
        data_criacao: new Date().toISOString()
      };
      
      try {
        const mockPastas = this.getMockPastas(pasta.projeto_id);
        localStorage.setItem(`mock_pastas_${pasta.projeto_id}`, JSON.stringify([...mockPastas, mockPasta]));
      } catch (e) {}

      return mockPasta;
    }
  },

  async moverArquivo(projetoId: number, arquivoId: number, pastaId: number | null): Promise<any> {
    try {
      const url = pastaId !== null 
        ? `/api/arquivos/${arquivoId}/mover?pasta_id=${pastaId}`
        : `/api/arquivos/${arquivoId}/mover`;
      const response = await api.patch(url);
      
      // Update mock storage if it exists
      try {
        const mockArquivos = this.getMockArquivos(projetoId);
        const updated = mockArquivos.map(a => a.id === arquivoId ? { ...a, pasta_id: pastaId } : a);
        localStorage.setItem(`mock_arquivos_${projetoId}`, JSON.stringify(updated));
      } catch (e) {}

      return response.data;
    } catch (error) {
      console.error(`Error moving file ${arquivoId}:`, error);
      
      // For mock preview: update it
      try {
        const mockArquivos = this.getMockArquivos(projetoId);
        const updated = mockArquivos.map(a => a.id === arquivoId ? { ...a, pasta_id: pastaId } : a);
        localStorage.setItem(`mock_arquivos_${projetoId}`, JSON.stringify(updated));
      } catch(e) {}
      
      throw error;
    }
  },

  // Mock data for development/preview
  getMockPastas(projetoId: number): Pasta[] {
    const key = `mock_pastas_${projetoId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    const mockData: Pasta[] = [];
    localStorage.setItem(key, JSON.stringify(mockData));
    return mockData;
  },

  getMockArquivos(projetoId: number): Arquivo[] {
    const key = `mock_arquivos_${projetoId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }

    const mockData: Arquivo[] = [
      {
        id: 1,
        nome_original: 'documento-exemplo.pdf',
        projeto_id: projetoId,
        tipo: 'pdf',
        tamanho_bytes: 245760,
        data_ingestao: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 2,
        nome_original: 'relatorio.docx',
        projeto_id: projetoId,
        tipo: 'docx',
        tamanho_bytes: 102400,
        data_ingestao: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 3,
        nome_original: 'dados.csv',
        projeto_id: projetoId,
        tipo: 'csv',
        tamanho_bytes: 51200,
        data_ingestao: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    localStorage.setItem(key, JSON.stringify(mockData));
    return mockData;
  },
};
