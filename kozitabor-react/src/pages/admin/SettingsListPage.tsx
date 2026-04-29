import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ListCard from '../../components/admin/ListCard';
import { type Setting } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';

const SettingsListPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const context = useDb();

    const [data, setData] = useState<Setting[]>([]);
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        context.getSettings()
            .then(setData)
            .catch(err => console.error('Hiba az adatok lekérésekor:', err))
            .finally(() => setLocalLoading(false));
    }, [context]);

    const handleDelete = async (id: number) => {
        try {
            await adminApiRequest(`/setting/${id}`, { method: 'DELETE' });
            context.removeSettingFromCache(id);
            setData(prev => prev.filter(s => s.id !== id));
            showToast('Sikeresen törölve.');
        } catch {
            showToast('Sikertelen törlés.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Beállítások</h1>
                <p className="text-gray-500 mt-1">Az alkalmazás globális paramétereinek kezelése.</p>
            </div>

            <div className="grid gap-4">
                {localLoading ? (
                    <div className="py-20 text-center text-gray-400 animate-pulse">Adatok betöltése...</div>
                ) : data.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        <p className="text-gray-500">Még nincsenek beállítások.</p>
                    </div>
                ) : (
                    data.map(item => (
                        <ListCard
                            key={item.id}
                            id={item.id.toString()}
                            icon={<Settings size={24} />}
                            title={item.label}
                            info={
                                <span className="text-sm text-gray-500 truncate max-w-xs block">
                                    {item.value || <span className="italic text-gray-300">nincs érték</span>}
                                </span>
                            }
                            editAction={() => navigate(`/admin/setting/${item.id}`)}
                            deleteAction={() => handleDelete(item.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SettingsListPage;
