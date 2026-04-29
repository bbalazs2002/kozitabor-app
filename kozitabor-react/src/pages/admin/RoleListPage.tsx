import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { type Role } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';

const RoleListPage = () => {
    const { showToast } = useToast();
    const context = useDb();

    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        context.getRoles().then(data => {
            setRoles(data);
            setLoading(false);
        });
    }, [context]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setSaving(true);
        try {
            const created = await adminApiRequest('/role', {
                method: 'POST',
                body: JSON.stringify({ name: newName.trim() })
            });
            context.addRoleToCache(created);
            setRoles(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
            setNewName('');
        } catch {
            showToast('Hiba a mentés közben.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (role: Role) => {
        try {
            await adminApiRequest(`/role/${role.id}`, { method: 'DELETE' });
            context.removeRoleFromCache(role.id);
            setRoles(prev => prev.filter(r => r.id !== role.id));
            showToast('Törölve.');
        } catch {
            showToast('Sikertelen törlés.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Szerepkörök</h1>
                <p className="text-gray-500 mt-1">Kontaktokhoz rendelhető szerepkörök kezelése.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-4 max-w-lg">
                {loading ? (
                    <div className="py-8 text-center text-gray-400 animate-pulse">Betöltés...</div>
                ) : roles.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Még nincsenek szerepkörök.</p>
                ) : (
                    <div className="space-y-2">
                        {roles.map(role => (
                            <div key={role.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                                <span className="font-semibold text-gray-800">{role.name}</span>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(role)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Törlés"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                    <form onSubmit={handleAdd} className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Új szerepkör neve..."
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-sm"
                        />
                        <button
                            type="submit"
                            disabled={saving || !newName.trim()}
                            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Hozzáad
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RoleListPage;
