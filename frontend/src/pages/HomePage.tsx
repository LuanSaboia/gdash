import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type WeatherPoint = {
  time: string;
  temperature: number | null;
};

export default function Home() {
  const [data, setData] = useState<WeatherPoint[]>([]);

  async function load() {
  const res = await api.get<WeatherPoint[]>("/api/weather/last-24h");

  setData(
    res.data.map((p) => ({
      time: new Date(p.time).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperature: p.temperature,
    }))
  );
}


  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Painel de Clima</h1>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">
          Temperatura — Últimas 24h
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis unit="°C" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#2563eb" // azul do tailwind
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
