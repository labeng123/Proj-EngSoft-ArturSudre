// Backend entity types matching servico_gestao and servico_ingestao

export interface Projeto {
  id?: number;
  nome: string;
  descricao?: string;
  data_criacao?: string;
  ultima_alteracao?: string;
}

export interface ProjetoCreate {
  nome: string;
  descricao?: string;
}

export interface Arquivo {
  id?: number;
  nome_original: string;
  projeto_id: number;
  tipo?: string;
  tamanho_bytes: number;
  data_ingestao?: string;
  pasta_id?: number | null;
}

export interface Pasta {
  id: number;
  nome: string;
  projeto_id: number;
  data_criacao: string;
}

export interface PastaCreate {
  nome: string;
  projeto_id: number;
}

export interface ArquivoUploadResponse {
  id: number;
  nome_original: string;
  projeto_id: number;
  tipo: string;
  tamanho_bytes: number;
  data_ingestao: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
}
