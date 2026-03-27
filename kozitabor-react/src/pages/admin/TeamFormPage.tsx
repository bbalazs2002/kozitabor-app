import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';
import { Input } from '../../components/admin/FormInputs';
import type { TeamData } from '../../types/forms';
import { useDb } from '../../context/admin/DbContext';
import { Loader2 } from 'lucide-react';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';
import type { Contact } from '../../types/database';
import { MultiSelect } from '../../components/admin/MultiSelect';

export const TeamFormPage = () => {
    // Default content
    const emptyForm: TeamData = {
        name: ""
    };

    // States
    const [formData, setFormData] = useState<TeamData>(emptyForm);
    const [leaderFormData, setLeaderFormData] = useState<number[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [localLoading, setLocalLoading] = useState(true);

    // Toast message
    const { showToast } = useToast();

    // Other variables
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useDb();
    const isEdit = id !== undefined && id !== 'new';

    // Get content from DB
    useEffect(() => {
        // 1. Ha nem edit mód, nincs mit betölteni
        if (!isEdit) {
            setLocalLoading(false);
            return;
        }

        // 2. ID ellenőrzése és konvertálása
        const parsedId = parseInt(id!, 10);
        if (isNaN(parsedId)) {
            console.error("Invalid ID");
            navigate('/admin/teams', { replace: true });
            return;
        }

        // 3. Adatlekérés
        const fetchLatest = async () => {
            try {
                setLocalLoading(true);
                const data = await context.getTeam(parsedId);
                if (!data) {
                    // Ha a szám stimmel, de a DB-ben nincs ilyen rekord
                    navigate('/admin/teams', { replace: true });
                    return;
                }
                setFormData({
                    name: data.name
                });
                setLeaderFormData(data.leaders ? data.leaders.map(item => item.contact.id) : []);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
        // Csak akkor fusson le újra, ha az ID változik
    }, [id, navigate, isEdit]);

    useEffect(() => {

        // Adatlekérés
        const fetchLatest = async () => {
            try {
                const data = await context.getContacts();
                if (!data) {
                    setContacts([]);
                    return;
                }
                setContacts(data);
            } catch (err) {
                setContacts([]);
                console.error("Hiba az adatok lekérésekor:", err);
            }
        };

        fetchLatest();
    }, [navigate, isEdit]);

    // Return loader
    if (localLoading) return (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Adatok betöltése...</p>
        </div>
    );

    // Form submit handler
    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async () => {

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/team/${id}` : '/team';

        try {
            const response = await adminApiRequest(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    leaderIds: leaderFormData
                })
            });

            // success
            isEdit ? context.updateTeamInCache(response) : context.addTeamToCache(response);
            navigate('/admin/teams'); 
            
        } catch (error) {
            console.error("Mentési hiba:", error);
            showToast("Hiba történt a mentés közben.", "error");
            throw error;
        }
    };

    // Main component
    return (
        <AdminForm
            title={isEdit ? 'Csapat szerkesztése' : 'Új csapat hozzáadása'}
            onSubmit={handleSubmit}
        >
            <AdminFormCard>
                <Input 
                    label="Csapatnév" 
                    value={formData.name}
                    onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                    required
                />
            </AdminFormCard>

            <AdminFormCard title="Vezetők">
                <MultiSelect 
                    label="Csapatvezetők"
                    placeholder="Kontakt kiválasztása..."
                    options={contacts}
                    selectedIds={leaderFormData}
                    onChange={(newIds) => setLeaderFormData(newIds)}
                />
            </AdminFormCard>
        </AdminForm>
    );
};