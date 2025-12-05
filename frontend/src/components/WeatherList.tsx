import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "./ui/button";

interface WeatherLog {
  id: string;
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  createdAt: string;
}

export default function WeatherList() {
  const [data, setData] = useState<WeatherLog[]>([]);

  useEffect(() => {
    api.get("/api/weather/logs") 
      .then(res => setData(res.data))
      .catch(err => console.error("Erro ao buscar clima:", err));
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('/api/weather/export/csv', { 
        responseType: 'blob' // diz pro axios que é um arquivo
      });
      
      // cria link temporario para o download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_clima.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar CSV", error);
      alert("Erro ao baixar o arquivo.");
    }
  };

  return (
    <div className="mt-4 p-4 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Últimos Registros ({data.length})</h2>
        
        <Button onClick={handleExport} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
          📥 Exportar CSV
        </Button>
      </div>

      {data.length === 0 && (
        <p className="text-gray-500">Nenhum dado encontrado ou carregando...</p>
      )}

      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">{item.city}</p>
              <p className="text-sm text-gray-500">
                {new Date(item.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-xl font-bold">{item.temperature}°C</p>
              <p className="text-sm">{item.condition}</p>
              <div className="text-xs text-gray-600 flex gap-2 mt-1">
                <span>💧 {item.humidity}%</span>
                <span>💨 {item.windSpeed} km/h</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}