import React from 'react';
import { 
  UploadCloud, 
  Users, 
  BarChart, 
  Presentation, 
  BookOpen, 
  Search,
  ExternalLink
} from 'lucide-react';

export function TopBar() {
  const navLinks = [
    {
      name: "Ingestão",
      icon: UploadCloud,
      url: "/",
      isExternal: false
    },
    {
      name: "Projetos e Usuários",
      icon: Users,
      url: "https://gerenciamento-projetos-users-e9fffgewdxe6gkfe.centralus-01.azurewebsites.net/#/login",
      isExternal: true
    },
    {
      name: "Relatórios",
      icon: BarChart,
      url: "https://moduloderelatorios.azurewebsites.net",
      isExternal: true
    },
    {
      name: "Apresentações",
      icon: Presentation,
      url: "https://modulo4-apresentacoes-v2.azurewebsites.net/docs",
      isExternal: true
    },
    {
      name: "Diagramas e Doc. Técnicos",
      icon: BookOpen,
      url: "https://modulo5-interface-e-nuvem.azurewebsites.net/",
      isExternal: true
    },
    {
      name: "Consulta",
      icon: Search,
      url: "https://docai-frontend-7wym.onrender.com/",
      isExternal: true
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 shadow-sm">
      <div className="flex h-16 w-full items-center px-4 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-2 sm:gap-6 min-w-max mx-auto">
          {navLinks.map((link, idx) => {
            const Icon = link.icon;
            const isActive = link.name === "Ingestão";

            return (
              <a
                key={idx}
                href={link.url}
                target={link.isExternal ? "_blank" : "_self"}
                rel={link.isExternal ? "noopener noreferrer" : ""}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`}
                title={link.name}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{link.name}</span>
                {link.isExternal && <ExternalLink className="h-3 w-3 opacity-50 ml-1" />}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
