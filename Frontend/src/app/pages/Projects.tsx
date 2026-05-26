import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gestaoApi } from '../services/gestaoApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { PlusCircle, Folder, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Projeto } from '../types';

export default function Projects() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Função robusta com proteção contra dados corrompidos
  const loadProjetos = async () => {
    setIsLoading(true);
    try {
      const data = await gestaoApi.getProjetos();
      // GARANTIA: Se não for um array, transforma em array vazio para evitar o erro do .map
      setProjetos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Falha ao carregar projetos:', error);
      toast.error('Erro ao conectar com o serviço de gestão.');
      setProjetos([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjetos();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Meus Projetos</h1>
        <Button onClick={() => toast.info("Funcionalidade de criação em breve")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* A renderização agora é segura */}
          {projetos.length > 0 ? (
            projetos.map((projeto) => (
              <Card 
                key={projeto.id} 
                className="hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/${projeto.id}`)}
              >
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {projeto.descricao || 'Sem descrição.'}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Nenhum projeto encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
