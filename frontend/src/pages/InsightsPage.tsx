import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

type Insight = {
  _id: string;
  text: string;
  createdAt?: string;
  weatherSnapshot?: any;
};

/* =========================
   Helpers (Copiar + Badge)
   ========================= */

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  alert("Insight copiado!");
}

function getInsightBadge(text: string) {
  const t = text.toLowerCase();

  if (
    t.includes("alerta") ||
    t.includes("chuva forte") ||
    t.includes("tempestade") ||
    t.includes("calor extremo") ||
    t.includes("vento forte")
  ) {
    return { label: "ALERTA", color: "bg-red-600 text-white" };
  }

  if (
    t.includes("atenção") ||
    t.includes("calor intenso") ||
    t.includes("tempo seco") ||
    t.includes("alta temperatura")
  ) {
    return { label: "ATENÇÃO", color: "bg-orange-500 text-white" };
  }

  return { label: "INFO", color: "bg-blue-500 text-white" };
}

/* ========================= */

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const limit = 10;

  const [generating, setGenerating] = useState(false);

  const load = useCallback(async (pageIndex = 0) => {
    setLoading(true);
    setError(null);
    try {
      const skip = pageIndex * limit;
      const res = await api.get(`/api/insights?limit=${limit}&skip=${skip}`);
      setInsights(res.data ?? []);
    } catch (err: any) {
      console.error("Erro ao buscar insights:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
    const id = setInterval(() => load(page), 60_000);
    return () => clearInterval(id);
  }, [load, page]);

  async function generateManual() {
    setGenerating(true);
    setError(null);
    try {
      const body = {
        weather: { manual: true },
        summary: "Insight manual gerado pelo usuário.",
        generated_by_ai: false,
      };

      await api.post("/api/insights", body);
      setPage(0);
      await load(0);
    } catch (err: any) {
      console.error("Erro ao gerar insight manual:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Erro ao gerar insight");
    } finally {
      setGenerating(false);
    }
  }

  function nextPage() {
    setPage((p) => p + 1);
  }
  function prevPage() {
    setPage((p) => Math.max(0, p - 1));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Insights da IA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Insights automáticos gerados a partir dos registros de clima.
          </p>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <button
            onClick={() => { setPage(0); load(0); }}
            className="px-3 py-2 bg-white border rounded shadow text-sm hover:bg-gray-50"
          >
            Atualizar
          </button>

          <button
            onClick={generateManual}
            disabled={generating}
            className="px-3 py-2 bg-blue-600 text-white rounded shadow text-sm disabled:opacity-60"
          >
            {generating ? "Gerando..." : "Gerar Insight Manualmente"}
          </button>
        </div>
      </header>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Último insight */}
      {loading && insights.length === 0 ? (
        <div className="p-6 bg-white rounded shadow text-gray-500">Carregando...</div>
      ) : (
        insights.length > 0 && (
          <article className="p-6 bg-gradient-to-r from-indigo-50 to-white border-l-4 border-indigo-500 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Último insight</h2>
                <p className="text-sm text-gray-400">
                  {insights[0].createdAt ? new Date(insights[0].createdAt).toLocaleString() : ""}
                </p>
              </div>

              {/* Botão copiar */}
              <button
                onClick={() => copyToClipboard(insights[0].text)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Copiar
              </button>
            </div>

            {/* Badge */}
            <div className="mt-2">
              {(() => {
                const b = getInsightBadge(insights[0].text);
                return (
                  <span className={`px-2 py-1 text-xs rounded ${b.color}`}>
                    {b.label}
                  </span>
                );
              })()}
            </div>

            <p className="mt-4 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: insights[0].text }} />

            {insights[0].weatherSnapshot && (
              <div className="mt-4 text-sm text-gray-600">
                <strong>Contexto:</strong>{" "}
                Temp: {insights[0].weatherSnapshot?.weather?.current_weather?.temperature ?? "—"}°C ·
                Umidade: {insights[0].weatherSnapshot?.weather?.current_weather?.humidity ?? "—"}% ·
                Vento: {insights[0].weatherSnapshot?.weather?.current_weather?.windspeed ?? "—"} km/h
              </div>
            )}
          </article>
        )
      )}

      {/* Lista de histórico */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Histórico de Insights</h3>
          <div className="text-sm text-gray-500">Página {page + 1}</div>
        </div>

        {insights.length === 0 && !loading ? (
          <div className="p-4 bg-white rounded shadow text-gray-500">Nenhum insight registrado.</div>
        ) : (
          <div className="grid gap-3">
            {insights.map((ins) => (
              <InsightCard key={ins._id} insight={ins} />
            ))}
          </div>
        )}
      </section>

      {/* Paginação */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Mostrando até {limit} por página</div>
        <div className="flex gap-2">
          <button
            onClick={prevPage}
            disabled={page === 0}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            ← Voltar
          </button>
          <button
            onClick={nextPage}
            className="px-3 py-2 border rounded"
          >
            Avançar →
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Insight Card
   ========================= */

function InsightCard({ insight }: { insight: any }) {
  const [open, setOpen] = useState(false);

  const badge = getInsightBadge(insight.text);

  return (
    <div className="bg-white p-4 rounded shadow-sm border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-gray-400">
            {insight.createdAt ? new Date(insight.createdAt).toLocaleString() : ""}
          </div>

          {/* Badge */}
          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${badge.color}`}>
            {badge.label}
          </span>

          <div
            className="mt-2 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: insight.text }}
          />
        </div>

        {/* Botão copiar */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => copyToClipboard(insight.text)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            Copiar
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="px-2 py-1 text-xs border rounded"
          >
            {open ? "Fechar" : "Detalhes"}
          </button>
        </div>
      </div>

      {open && (
        <pre className="mt-3 p-3 bg-gray-50 text-xs text-gray-700 rounded overflow-auto">
          {JSON.stringify(insight.weatherSnapshot ?? {}, null, 2)}
        </pre>
      )}
    </div>
  );
}
