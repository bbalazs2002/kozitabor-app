import { Clock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminButton from "../../components/admin/AdminButton";
import ListCard from "../../components/admin/ListCard";
import { useDb } from "../../context/admin/DbContext";
import { useToast } from "../../context/admin/ToastContext";
import { type Deadline } from "../../types/database";
import { adminApiRequest } from "../../utils/api";
import { getDayDate } from "../../utils/dateHelpers";

const DeadlineListPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const context = useDb();

  const [data, setData] = useState<Deadline[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    context
      .getDeadlines()
      .then(setData)
      .catch((err) => console.error("Hiba az adatok lekérésekor:", err))
      .finally(() => setLocalLoading(false));
  }, [context]);

  const handleDelete = async (id: number) => {
    try {
      await adminApiRequest(`/deadline/${id}`, { method: "DELETE" });
      context.removeDeadlineFromCache(id);
      setData((prev) => prev.filter((d) => d.id !== id));
      showToast("Sikeresen törölve.");
    } catch {
      showToast("Sikertelen törlés.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Határidők
          </h1>
          <p className="text-gray-500 mt-1">
            A főoldalon megjelenő fontos határidők kezelése.
          </p>
        </div>
        <AdminButton
          to="/admin/deadline/new"
          icon={<Plus size={20} />}
          className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
        >
          Új határidő
        </AdminButton>
      </div>

      <div className="grid gap-4">
        {localLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">
            Adatok betöltése...
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">Még nincsenek határidők.</p>
          </div>
        ) : (
          data.map((item) => (
            <ListCard
              key={item.id}
              id={item.id.toString()}
              icon={<Clock size={24} />}
              title={item.label}
              info={
                <span className="text-sm text-gray-500">{getDayDate(item.date)}</span>
              }
              editAction={() => navigate(`/admin/deadline/${item.id}`)}
              deleteAction={() => handleDelete(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DeadlineListPage;
