import { useEffect, useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import AdminButton from '../../components/admin/AdminButton';
import { type Info as InfoType } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import DynamicIcon from '../../components/admin/DynamicIcon';
import ListCard from '../../components/admin/ListCard';
import { useNavigate } from 'react-router-dom';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';

const InfoListPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();

    // DB
    const context = useDb();
    const [data, setData] = useState<InfoType[]>([]);
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = await context.getInfos();
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fontos információk</h1>
          <p className="text-gray-500 mt-1">Szerkeszd az alkalmazásban megjelenő információs kártyákat.</p>
        </div>
        <AdminButton 
          to="/admin/info/new" 
          icon={<Plus size={20} />} 
          className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
        >
          Új kártya létrehozása
        </AdminButton>
      </div>

      {/* Lista konténer (Grid helyett Stack) */}
      <div className="grid gap-4">
        {localLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">Adatok betöltése...</div>
        ) : data.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">Még nincsenek létrehozott információs kártyák.</p>
          </div>
        ) : (
          data.map((item) => (
            <ListCard
                key={item.id}
                id={item.id.toString()}
                icon={<DynamicIcon name={item.icon} size="24" />}
                title={item.title}
                info={ item.map ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                        <MapPin size={10} /> Térkép aktív
                    </span>)
                    : ""
                }
                editAction={() => navigate(`/admin/info/${item.id}`)}
                deleteAction={async () => {
                    try {
                        const resp = await adminApiRequest(`/info/${item.id}`, {
                            method: 'DELETE'
                        });

                        context.removeInfoFromCache(resp.id);
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

export default InfoListPage;