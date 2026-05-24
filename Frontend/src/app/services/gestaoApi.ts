import axios from 'axios';
import type { Projeto, ProjetoCreate, DeleteResponse } from '../types';

let API_BASE_URL = import.meta.env.VITE_GESTAO_API_URL || 'http://localhost:8001';

// Garante que URLs em produção não usem HTTP para evitar erro de Mixed Content
if (API_BASE_URL.includes('azurewebsites.net') && API_BASE_URL.startsWith('http://')) {
  API_BASE_URL = API_BASE_URL.replace('http://', 'https://');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gestaoApi = {
  // Get all projects
  async getProjetos(): Promise<Projeto[]> {
    try {
      const response = await api.get<Projeto[]>('/api/projetos/');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Return mock data for development/preview
      return this.getMockProjetos();
    }
  },

  // Get project by ID (backend doesn't have this endpoint, so we get from list)
  async getProjetoById(id: number): Promise<Projeto | null> {
    try {
      // Backend doesn't have GET /api/projetos/{id}, so we get all and filter
      const projetos = await this.getProjetos();
      return projetos.find(p => p.id === id) || null;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      const mockProjects = this.getMockProjetos();
      return mockProjects.find(p => p.id === id) || null;
    }
  },

  // Create new project
  async createProjeto(data: ProjetoCreate): Promise<Projeto> {
    try {
      const response = await api.post<Projeto>('/api/projetos/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      // Mock response for development
      const mockProjects = this.getMockProjetos();
      const newId = Math.max(...mockProjects.map(p => p.id || 0), 0) + 1;
      return {
        id: newId,
        ...data,
        data_criacao: new Date().toISOString(),
        ultima_alteracao: new Date().toISOString(),
      };
    }
  },

  // Update project
  async updateProjeto(id: number, data: Partial<ProjetoCreate>): Promise<Projeto> {
    try {
      const response = await api.put<Projeto>(`/api/projetos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      const existing = await this.getProjetoById(id);
      return {
        ...existing!,
        ...data,
        ultima_alteracao: new Date().toISOString(),
      };
    }
  },

  // Delete project
  async deleteProjeto(id: number): Promise<DeleteResponse> {
    try {
      const response = await api.delete<DeleteResponse>(`/api/projetos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      return {
        success: true,
        message: 'Project deleted (mock mode)',
      };
    }
  },

  // Mock data for development/preview
  getMockProjetos(): Projeto[] {
    const stored = localStorage.getItem('mock_projetos');
    if (stored) {
      return JSON.parse(stored);
    }

    const mockData: Projeto[] = [
      {
        id: 1,
        nome: 'Projeto Demo 1',
        descricao: 'Projeto de demonstração para testes',
        data_criacao: new Date().toISOString(),
        ultima_alteracao: new Date().toISOString(),
      },
      {
        id: 2,
        nome: 'Projeto Demo 2',
        descricao: 'Segundo projeto de exemplo',
        data_criacao: new Date().toISOString(),
        ultima_alteracao: new Date().toISOString(),
      },
    ];

    localStorage.setItem('mock_projetos', JSON.stringify(mockData));
    return mockData;
  },
};
