import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

// Tipagem do Pokémon Detalhado
interface PokemonDetail {
  id: number;
  name: string;
  image: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: { name: string; value: number }[];
}

export default function ExplorePage() {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estados do Modal
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<PokemonDetail | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Carregar Lista
  async function loadList(p: number) {
    setLoading(true);
    try {
      const res = await api.get(`/api/explorer/pokemons?page=${p}`);
      setPokemons(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Carregar Detalhes (Quando clica no card)
  async function loadDetails(id: string) {
    setLoadingDetails(true);
    setDetails(null); // Limpa anterior
    try {
      const res = await api.get(`/api/explorer/pokemons/${id}`);
      setDetails(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    loadList(page);
  }, [page]);

  // Efeito para buscar detalhes quando um ID é selecionado
  useEffect(() => {
    if (selectedId) {
      loadDetails(selectedId);
    }
  }, [selectedId]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pokédex</h1>
          <p className="text-gray-500">Explore dados da PokéAPI</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Button 
            variant="outline" 
            disabled={page === 1 || loading}
            onClick={() => setPage(p => p - 1)}
          >
            ← Anterior
          </Button>
          <span className="font-mono bg-gray-100 px-3 py-1 rounded text-sm">
            Pág {page}
          </span>
          <Button 
            variant="outline" 
            disabled={loading}
            onClick={() => setPage(p => p + 1)}
          >
            Próximo →
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Carregando Pokémons...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pokemons.map((poke) => (
            <div 
              key={poke.id} 
              onClick={() => setSelectedId(poke.id)}
              className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-lg hover:border-blue-300 transition cursor-pointer flex flex-col items-center group"
            >
              <img 
                src={poke.image} 
                alt={poke.name} 
                className="w-24 h-24 object-contain group-hover:scale-110 transition-transform"
              />
              <span className="capitalize font-bold text-gray-700 mt-2 group-hover:text-blue-600">
                {poke.name}
              </span>
              <span className="text-xs text-gray-400">#{poke.id}</span>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DE DETALHES --- */}
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="sm:max-w-md">
          
          {loadingDetails || !details ? (
             <div className="py-10 text-center text-gray-500">Carregando detalhes...</div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize text-2xl flex items-center gap-2">
                   {details.name} 
                   <span className="text-sm text-gray-400 font-normal">#{details.id}</span>
                </DialogTitle>
                <DialogDescription>
                    Detalhes técnicos e estatísticas.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center mb-4">
                <img src={details.image} alt={details.name} className="w-40 h-40 object-contain drop-shadow-md" />
                
                <div className="flex gap-2 mt-2">
                    {details.types.map(t => (
                        <span key={t} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full uppercase font-bold">
                            {t}
                        </span>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500 text-xs">Altura</p>
                      <p className="font-semibold">{details.height} m</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500 text-xs">Peso</p>
                      <p className="font-semibold">{details.weight} kg</p>
                  </div>
              </div>

              <div>
                  <h4 className="font-semibold mb-2 text-sm">Estatísticas Base</h4>
                  <div className="space-y-1">
                      {details.stats.map(s => (
                          <div key={s.name} className="flex items-center text-xs">
                              <span className="w-24 capitalize text-gray-600">{s.name.replace('-', ' ')}</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-green-500 h-full rounded-full" 
                                    style={{ width: `${Math.min(100, (s.value / 150) * 100)}%` }}
                                  />
                              </div>
                              <span className="w-8 text-right font-mono">{s.value}</span>
                          </div>
                      ))}
                  </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}