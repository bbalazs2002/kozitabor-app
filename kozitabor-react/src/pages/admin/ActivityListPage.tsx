import { useEffect, useState } from 'react';
import { Plus, List } from 'lucide-react';
import AdminButton from '../../components/admin/AdminButton';
import { type Activity } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import ListCard from '../../components/admin/ListCard';
import { useNavigate } from 'react-router-dom';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';

const ActivityListPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // DB
  const context = useDb();
  const [data, setData] = useState<Activity[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  useEffect(() => {
      const fetchLatest = async () => {
          try {
              const data = await context.getActivities();
              setData(data);
          } catch (err) {
              console.error("Hiba az adatok lekérésekor:", err);
          } finally {
              setLocalLoading(false);
          }
      };

      fetchLatest();
  }, [context]);

  return (
    <div className="space-y-6">
      {/* Header Szekció */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tevékenységek</h1>
          <p className="text-gray-500 mt-1">Szerkeszd a feladatnak válsztható tevékenységeket.</p>
        </div>
        <AdminButton 
          to="/admin/activity/new" 
          icon={<Plus size={20} />} 
          className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
        >
          Új tevékenység létrehozása
        </AdminButton>
      </div>

      {/* Lista konténer */}
      <div className="grid gap-4">
        {localLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">Adatok betöltése...</div>
        ) : data.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">Még nincsenek létrehozott tevékenységek.</p>
          </div>
        ) : (
          data.map((item) => (
            <ListCard
                key={item.id}
                id={item.id.toString()}
                icon={<List size="24" />}
                title={item.title}
                editAction={() => navigate(`/admin/activity/${item.id}`)}
                deleteAction={async () => {
                    try {
                        const resp = await adminApiRequest(`/activity/${item.id}`, {
                            method: 'DELETE'
                        });

                        context.removeActivityFromCache(resp.id);
                        showToast("Sikeresen törölve.");
                    } catch (err) {
                        showToast("Sikertelen törlés.", 'error');
                    }
                }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityListPage;