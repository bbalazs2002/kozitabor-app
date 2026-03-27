import { useEffect, useState } from 'react';
import { Plus, Users2 } from 'lucide-react';
import AdminButton from '../../components/admin/AdminButton';
import { type Team } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import ListCard from '../../components/admin/ListCard';
import { useNavigate } from 'react-router-dom';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';

const TeamListPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // DB
  const context = useDb();
  const [data, setData] = useState<Team[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  useEffect(() => {
      const fetchLatest = async () => {
          try {
              const data = await context.getTeams();
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Csapatok</h1>
          <p className="text-gray-500 mt-1">Szerkeszd az alkalmazásban megjelenő csapatokat.</p>
        </div>
        <AdminButton 
          to="/admin/team/new" 
          icon={<Plus size={20} />} 
          className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
        >
          Új csapat létrehozása
        </AdminButton>
      </div>

      {/* Lista konténer (Grid helyett Stack) */}
      <div className="grid gap-4">
        {localLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">Adatok betöltése...</div>
        ) : data.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">Még nincsenek létrehozott csapatok.</p>
          </div>
        ): (
          data.map((item) => (
            <ListCard
                key={item.id}
                id={item.id.toString()}
                icon={<Users2 size="24" />}
                title={item.name}
                editAction={() => navigate(`/admin/team/${item.id}`)}
                deleteAction={async () => {
                    try {
                        const resp = await adminApiRequest(`/team/${item.id}`, {
                            method: 'DELETE'
                        });

                        context.removeTeamFromCache(resp.id);
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

export default TeamListPage;