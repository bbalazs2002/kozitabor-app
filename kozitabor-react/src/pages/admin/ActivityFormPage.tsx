import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';
import { Input } from '../../components/admin/FormInputs';
import type { ActivityData } from '../../types/forms';
import { useDb } from '../../context/admin/DbContext';
import { Loader2 } from 'lucide-react';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';

export const ActivityFormPage = () => {
    // Default content
    const emptyForm: ActivityData = {
        title: ""
    };

    // States
    const [formData, setFormData] = useState<ActivityData>(emptyForm);
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
            navigate('/admin/activities', { replace: true });
            return;
        }

        // 3. Adatlekérés
        const fetchLatest = async () => {
            try {
                setLocalLoading(true);
                const data = await context.getActivity(parsedId);
                if (!data) {
                    // Ha a szám stimmel, de a DB-ben nincs ilyen rekord
                    navigate('/admin/activities', { replace: true });
                    return;
                }
                setFormData({
                    title: data.title
                });
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
        // Csak akkor fusson le újra, ha az ID változik
    }, [id, navigate, isEdit]);

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
        const url = isEdit ? `/activity/${id}` : '/activity';

        try {
            const response = await adminApiRequest(url, {
                method,
                body: JSON.stringify({
                    ...formData
                })
            });

            // success
            isEdit ? context.updateActivityInCache(response) : context.addActivityToCache(response);
            navigate('/admin/activities'); 
            
        } catch (error) {
            console.error("Mentési hiba:", error);
            showToast("Hiba történt a mentés közben.", "error");
            throw error;
        }
    };

    // Main component
    return (
        <AdminForm
            title={isEdit ? 'Tevékenység szerkesztése' : 'Új tevékenység hozzáadása'}
            onSubmit={handleSubmit}
        >
            <AdminFormCard>
                <Input 
                    label="Megnevezés" 
                    value={formData.title}
                    onChange={(e: any) => setFormData({...formData, title: e.target.value})}
                    required
                />
            </AdminFormCard>
        </AdminForm>
    );
};