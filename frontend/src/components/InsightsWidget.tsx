import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function InsightsWidget() {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Busca apenas o último insight
  async function loadLatest() {
    setLoading(true);
    try {
      // Pega a lista (que já vem ordenada) e usa o primeiro
      const res = await api.get("/api/insights");
      if (res.data && res.data.length > 0) {
        setInsight(res.data[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar insight", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLatest();
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await api.post("/api/insights/generate");
      toast.success("Novo insight gerado!");
      await loadLatest(); // Atualiza o widget
    } catch (error) {
      toast.error("Erro ao gerar insight.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">⚡ Insight do Dia</h2>
        <Button 
          onClick={handleGenerate} 
          disabled={generating} 
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {generating ? "Gerando..." : "Gerar Novo"}
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : insight ? (
          <div className="text-center w-full">
            <p className="text-lg text-gray-700 font-medium leading-relaxed italic">
              "{insight.summary}"
            </p>
            <p className="text-xs text-gray-400 mt-4 text-right">
              Atualizado em: {new Date(insight.date).toLocaleString('pt-BR')}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma análise disponível ainda.</p>
        )}
      </div>
    </div>
  );
}