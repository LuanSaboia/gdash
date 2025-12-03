interface DashboardCardProps {
  title: string;
  value?: string | number;
  children?: React.ReactNode;
}

export default function DashboardCard({ title, value, children }: DashboardCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>

      {value && (
        <p className="text-2xl font-bold text-gray-900 mb-3">{value}</p>
      )}

      {children}
    </div>
  );
}
