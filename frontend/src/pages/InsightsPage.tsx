import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button"; // Usando botão bonito se tiver
import { toast } from "sonner"; // Para feedback visual

// 1. Tipagem correta igual ao que vem do Backend (Prisma)
type Insight = {
  id: string;        // Prisma retorna 'id'
  summary: string;   // Backend envia 'summary'
  date: string;      // Backend envia 'date'
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copiado para a área de transferência!");
}

function getInsightBadge(text: string) {
  const t = (text || "").toLowerCase();
  if (t.includes("falha") || t.includes("erro")) return { label: "ERRO", color: "bg-red-600 text-white" };
  if (t.includes("chuva") || t.includes("alerta")) return { label: "ALERTA", color: "bg-orange-500 text-white" };
  return { label: "INFO", color: "bg-blue-500 text-white" };
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Busca a lista de insights
  const load = useCallback(async () => {
    setLoading(true);
    try {
      // O backend retorna um array direto
      const res = await api.get<Insight[]>("/api/insights");
      setInsights(res.data);
    } catch (err) {
      console.error("Erro ao buscar insights:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chama ao carregar a página
  useEffect(() => {
    load();
  }, [load]);

  // Função para pedir para a IA gerar um novo
  async function handleGenerateAI() {
    setGenerating(true);
    try {
      // Chama a rota correta do Controller
      await api.post("/api/insights/generate");
      toast.success("IA gerou um novo insight!");
      await load(); // Recarrega a lista para mostrar o novo
    } catch (err) {
      console.error("Erro ao gerar:", err);
      toast.error("Erro ao conectar com a IA.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Insights da IA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Análises meteorológicas geradas pelo Google Gemini.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={load} 
            disabled={loading || generating}
          >
            🔄 Atualizar
          </Button>

          <Button 
            onClick={handleGenerateAI} 
            disabled={generating}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {generating ? "✨ Gerando..." : "✨ Gerar Novo Insight"}
          </Button>
        </div>
      </header>

      {/* Lista de Cards */}
      <section className="space-y-4">
        {loading && insights.length === 0 && (
          <p className="text-center text-gray-500 py-10">Carregando análises...</p>
        )}

        {!loading && insights.length === 0 && (
          <div className="text-center py-10 bg-white rounded shadow border border-dashed">
            <p className="text-gray-500 mb-2">Nenhum insight gerado ainda.</p>
            <Button variant="link" onClick={handleGenerateAI}>Clique para gerar o primeiro</Button>
          </div>
        )}

        {insights.map((insight) => {
          const badge = getInsightBadge(insight.summary);
          return (
            <div key={insight.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(insight.date).toLocaleString('pt-BR')}
                  </span>
                </div>
                <button 
                  onClick={() => copyToClipboard(insight.summary)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Copiar
                </button>
              </div>
              
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {insight.summary}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
}