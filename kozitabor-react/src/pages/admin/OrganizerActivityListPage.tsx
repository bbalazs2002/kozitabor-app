import { useEffect, useState } from 'react';
import { Plus, List } from 'lucide-react';
import AdminButton from '../../components/admin/AdminButton';
import { type OrganizerActivity } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import ListCard from '../../components/admin/ListCard';
import { useNavigate } from 'react-router-dom';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';

const OrganizerActivityListPage = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const context = useDb();

    const [data, setData] = useState<OrganizerActivity[]>([]);
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        context.getOrganizerActivities().then(d => {
            setData(d);
            setLocalLoading(false);
        });
    }, [context]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Szervezői tevékenységek</h1>
                    <p className="text-gray-500 mt-1">Szervezői feladatokhoz rendelhető tevékenységtípusok.</p>
                </div>
                <AdminButton
                    to="/admin/organizer-activity/new"
                    icon={<Plus size={20} />}
                    className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
                >
                    Új tevékenység létrehozása
                </AdminButton>
            </div>

            <div className="grid gap-4">
                {localLoading ? (
                    <div className="py-20 text-center text-gray-400 animate-pulse">Adatok betöltése...</div>
                ) : data.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        <p className="text-gray-500">Még nincsenek létrehozott szervezői tevékenységek.</p>
                    </div>
                ) : (
                    data.map(item => (
                        <ListCard
                            key={item.id}
                            id={item.id.toString()}
                            icon={<List size={24} />}
                            title={item.title}
                            editAction={() => navigate(`/admin/organizer-activity/${item.id}`)}
                            deleteAction={async () => {
                                try {
                                    const resp = await adminApiRequest(`/organizer-activity/${item.id}`, { method: 'DELETE' });
                                    context.removeOrganizerActivityFromCache(resp.id);
                                    setData(prev => prev.filter(a => a.id !== resp.id));
                                    showToast('Sikeresen törölve.');
                                } catch {
                                    showToast('Sikertelen törlés.', 'error');
                                }
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default OrganizerActivityListPage;
