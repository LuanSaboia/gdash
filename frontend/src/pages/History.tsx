import { useEffect, useState } from "react";

export default function History() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  async function loadData() {
    setLoading(true);
    const res = await fetch(
      `http://localhost:3000/api/weather?limit=${limit}&skip=${page * limit}`
    );
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [page]);

  function nextPage() {
    setPage(page + 1);
  }

  function prevPage() {
    if (page > 0) setPage(page - 1);
  }

  async function exportCSV() {
    const res = await fetch("http://localhost:3000/api/weather/export", {
      method: "GET",
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "weather-history.csv";
    a.click();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico de Clima</h1>

      <button
        onClick={exportCSV}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Exportar CSV
      </button>

      {loading && <p>Carregando...</p>}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Horário</th>
            <th className="p-2 border">Temperatura</th>
            <th className="p-2 border">Umidade</th>
            <th className="p-2 border">Código</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item._id} className="border">
              <td className="p-2 border">{item.fetched_at}</td>
              <td className="p-2 border">
                {item.current_weather?.temperature} °C
              </td>
              <td className="p-2 border">
                {item.current_weather?.humidity ?? "-"} %
              </td>
              <td className="p-2 border">
                {item.current_weather?.weathercode}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 mt-4">
        <button
          onClick={prevPage}
          disabled={page === 0}
          className="px-3 py-2 border rounded"
        >
          ← Voltar
        </button>

        <button onClick={nextPage} className="px-3 py-2 border rounded">
          Avançar →
        </button>
      </div>
    </div>
  );
}
