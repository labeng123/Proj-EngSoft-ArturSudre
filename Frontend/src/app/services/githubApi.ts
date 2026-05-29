import axios from 'axios';

const api = axios.create({
  baseURL: 'https://apigithub.azurewebsites.net'
});

export interface GitHubRepo {
  nome: string;
  url: string;
  visibilidade: string;
}

export interface GitHubBranch {
  nome: string;
}

export interface GitHubPR {
  titulo: string;
  estado: string;
  url: string;
  autor: string;
}

export const githubApi = {
  listarRepositorios: async (usuario: string): Promise<GitHubRepo[]> => {
    const response = await api.get(`/repositorios/${usuario}`);
    return response.data;
  },
  listarBranches: async (usuario: string, repositorio: string): Promise<GitHubBranch[]> => {
    const response = await api.get(`/repositorios/${usuario}/${repositorio}/branches`);
    return response.data;
  },
  listarPRs: async (usuario: string, repositorio: string): Promise<GitHubPR[]> => {
    const response = await api.get(`/repositorios/${usuario}/${repositorio}/prs`);
    return response.data;
  }
};
