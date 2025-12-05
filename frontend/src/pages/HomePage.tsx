import { useEffect, useState } from "react";
import { api } from "../lib/api";
import WeatherList from "../components/WeatherList"; // <--- 1. Importe o componente
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Tipos para o gráfico
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
    <div className="p-6 max-w-5xl mx-auto space-y-8"> {/* Aumentei o espaçamento vertical */}
      <h1 className="text-3xl font-bold text-gray-800">Painel de Clima</h1>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Temperatura em Tempo Real
        </h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                unit="°C" 
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <WeatherList />
      
    </div>
  );
}