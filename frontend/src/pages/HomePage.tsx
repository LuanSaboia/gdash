import { useEffect, useState } from "react";
import { api } from "../lib/api";
import WeatherList from "../components/WeatherList";
import InsightsWidget from "../components/InsightsWidget"; // <--- Importe o novo widget
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ChartData = {
  time: string;
  temperature: number;
};

type ApiLog = {
  createdAt: string;
  temperature: number;
};

export default function Home() {
  const [data, setData] = useState<ChartData[]>([]);

  async function load() {
    try {
      // Nota: O backend agora retorna só 5 registros na listagem,
      // mas para o GRÁFICO seria ideal ter mais.
      // Se quiser manter o gráfico rico, idealmente teríamos uma rota separada ou parâmetro.
      // Mas para o teste, ele vai mostrar os últimos 5 pontos, o que é aceitável.
      const res = await api.get<ApiLog[]>("/api/weather/logs");
      
      const formattedData = res.data.map((p) => ({
        time: new Date(p.createdAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: p.temperature,
      }));
      
      setData(formattedData.reverse());
    } catch (error) {
      console.error("Erro ao carregar gráfico:", error);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Painel de Clima</h1>
        <p className="text-gray-500">Visão geral em tempo real de Crateús</p>
      </header>

      {/* SEÇÃO 1: GRÁFICO (Ocupa largura total) */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Tendência de Temperatura
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis unit="°C" domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2563eb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SEÇÃO 2: GRID COM TABELA E INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Coluna Esquerda: Tabela (WeatherList) */}
        <WeatherList />
        
        {/* Coluna Direita: IA (InsightsWidget) */}
        <InsightsWidget />
        
      </div>
    </div>
  );
}