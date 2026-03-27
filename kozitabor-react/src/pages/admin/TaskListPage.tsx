import React, { useEffect, useState } from 'react';
import { useDb } from '../../context/admin/DbContext';
import ListCard from '../../components/admin/ListCard';
import { adminApiRequest } from '../../utils/api';
import { formatOffsetToTime, getDayDate } from '../../utils/dateHelpers';
import { MenuSquare, Plus } from 'lucide-react';
import AdminButton from '../../components/admin/AdminButton';
import { useToast } from '../../context/admin/ToastContext';

const TaskListPage: React.FC = () => {

  const {showToast} = useToast();

  const context = useDb();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [context]);

  const loadData = async () => {
    const data = await context.getTasks();

    // Csoportosítás napok szerint
    const groupedData = data.reduce((acc: any, d) => {
      const dayLabel = getDayDate(d.day);
      if (!acc[dayLabel]) acc[dayLabel] = [];
      acc[dayLabel].push(d);
      return acc;
    }, {});

    setData(groupedData);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApiRequest(`/task/${id}`, { method: 'DELETE' });
      context.removeTaskFromCache(id);
      showToast("Sikeresen törölve.");
    } catch (err) {
      showToast("Hiba a törlés során.", "error");
    }
  };

  if (loading) return <div className="p-8 text-center">Betöltés...</div>;

  return (
    <div className="space-y-6">
      {/* Header Szekció */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Feladatok</h1>
          <p className="text-gray-500 mt-1">Szerkeszd az alkalmazásban megjelenő feladatokat.</p>
        </div>
        <AdminButton 
          to="/admin/task/new" 
          icon={<Plus size={20} />} 
          className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
        >
          Új feladat létrehozása
        </AdminButton>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse">Adatok betöltése...</div>
      ) : Object.keys(data).length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
          <p className="text-gray-500">Még nincsenek létrehozott feladatok.</p>
        </div>
      ) : (
        Object.entries(data).map(([day, items]) => (
          <div key={day} className="mb-8">
            <h2 className="text-lg font-semibold text-blue-800 border-b-2 border-blue-100 mb-4 pb-1 capitalize">
              {day}
            </h2>
            <div className="space-y-3">
              {items.map((task: any) => (
                <ListCard
                  key={task.id}
                  id={task.id}
                  icon={<MenuSquare size="24" />}
                  title={`${formatOffsetToTime(task.timeOffset)} - ${task.activity.title}`}
                  info={`Csapat: ${task.team.name}`}
                  deleteAction={() => handleDelete(task.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}

    </div>
  );
};

export default TaskListPage;