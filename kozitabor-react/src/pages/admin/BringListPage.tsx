import { useEffect, useState } from 'react';
import { Plus, Check } from 'lucide-react';
import AdminButton from '../../components/admin/AdminButton';
import { type Bring } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import ListCard from '../../components/admin/ListCard';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';

const BringListPage = () => {
  const { showToast } = useToast();

  // DB
  const context = useDb();
  const [data, setData] = useState<Bring[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  useEffect(() => {
      const fetchLatest = async () => {
          try {
              const data = await context.getBrings();
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mit hozz?</h1>
          <p className="text-gray-500 mt-1">Szerkeszd, hogy milyen elemek jelenjenek meg az alkalmazás Mit hozz? oldalán.</p>
        </div>
        <AdminButton 
          to="/admin/bring/new" 
          icon={<Plus size={20} />} 
          className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
        >
          Új elem létrehozása
        </AdminButton>
      </div>

      {/* Lista konténer */}
      <div className="grid gap-4">
        {localLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">Adatok betöltése...</div>
        ) : data.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">Még nincsenek létrehozott elemek.</p>
          </div>
        ) : (
          data.map((item) => (
            <ListCard
                key={item.id}
                id={item.id.toString()}
                icon={<Check size="24" />}
                title={item.title}
                deleteAction={async () => {
                    try {
                        const resp = await adminApiRequest(`/bring/${item.id}`, {
                            method: 'DELETE'
                        });

                        context.removeBringFromCache(resp.id);
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

export default BringListPage;