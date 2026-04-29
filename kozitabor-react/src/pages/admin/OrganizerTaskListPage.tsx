import React, { useEffect, useState } from 'react';
import { MenuSquare, Plus } from 'lucide-react';
import AdminButton from '../../components/admin/AdminButton';
import ListCard from '../../components/admin/ListCard';
import { type OrganizerTask } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import { adminApiRequest } from '../../utils/api';
import { formatOffsetToTime, groupByDay } from '../../utils/dateHelpers';
import { useToast } from '../../context/admin/ToastContext';

const OrganizerTaskListPage: React.FC = () => {
    const { showToast } = useToast();
    const context = useDb();

    const [grouped, setGrouped] = useState<Record<string, OrganizerTask[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        context.getOrganizerTasks().then(data => {
            setGrouped(groupByDay(data, 'day'));
            setLoading(false);
        });
    }, [context]);

    const handleDelete = async (id: number) => {
        try {
            await adminApiRequest(`/organizer-task/${id}`, { method: 'DELETE' });
            context.removeOrganizerTaskFromCache(id);
            setGrouped(prev => {
                const next = { ...prev };
                for (const day in next) {
                    next[day] = next[day].filter(t => t.id !== id);
                    if (next[day].length === 0) delete next[day];
                }
                return next;
            });
            showToast('Sikeresen törölve.');
        } catch {
            showToast('Hiba a törlés során.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Szervezői feladatok</h1>
                    <p className="text-gray-500 mt-1">Szervező-beosztás kezelése napok szerint.</p>
                </div>
                <AdminButton
                    to="/admin/organizer-task/new"
                    icon={<Plus size={20} />}
                    className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
                >
                    Új feladat létrehozása
                </AdminButton>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">Adatok betöltése...</div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                    <p className="text-gray-500">Még nincsenek szervezői feladatok.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([day, items]) => (
                    <div key={day}>
                        <h2 className="text-lg font-semibold text-blue-800 border-b-2 border-blue-100 mb-4 pb-1 capitalize">
                            {day}
                        </h2>
                        <div className="space-y-3">
                            {items.map(task => (
                                <ListCard
                                    key={task.id}
                                    id={task.id.toString()}
                                    icon={<MenuSquare size={24} />}
                                    title={`${formatOffsetToTime(task.timeOffset)} – ${task.organizerActivity.title}`}
                                    info={`Szervező: ${task.contact.name}`}
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

export default OrganizerTaskListPage;
