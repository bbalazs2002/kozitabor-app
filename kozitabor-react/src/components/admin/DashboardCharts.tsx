export const CustomTooltip = ({ payload, active }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border bg-white p-2 shadow-xl border-slate-200">
      {payload.map((category: any, idx: number) => (
        <div key={idx} className="flex flex-col">
          <span className="text-sm font-medium text-slate-600">
            {category.payload.name || category.payload.teamName}
          </span>
          <span className="text-lg font-bold text-slate-900">
            {category.value} {category.unit || "db"}
          </span>
        </div>
      ))}
    </div>
  );
};