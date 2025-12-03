import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function WeatherList() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/weather")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="mt-4 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Últimos Registros</h2>

      {data.length === 0 && (
        <p className="text-gray-500">Nenhum dado encontrado.</p>
      )}

      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item._id} className="border p-3 rounded">
            <p><strong>Horário:</strong> {item.fetched_at}</p>
            <p><strong>Temperatura:</strong> {item.current_weather?.temperature}°C</p>
            <p><strong>Umidade:</strong> {item.current_weather?.relativehumidity_2m ?? "—"}%</p>
            <p><strong>Umidade:</strong> {item.current_weather?.humidity ?? "—"}%</p>

          </li>
        ))}
      </ul>
    </div>
  );
}
