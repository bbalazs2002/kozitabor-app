import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Input } from '../../components/admin/FormInputs';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';
import { useDb } from '../../context/admin/DbContext';
import { useToast } from '../../context/admin/ToastContext';
import { adminApiRequest } from '../../utils/api';
import type { ActivityData } from '../../types/forms';

export const OrganizerActivityFormPage = () => {
    const [formData, setFormData] = useState<ActivityData>({ title: '' });
    const [localLoading, setLocalLoading] = useState(true);

    const { showToast } = useToast();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useDb();
    const isEdit = id !== undefined && id !== 'new';

    useEffect(() => {
        if (!isEdit) { setLocalLoading(false); return; }

        const parsedId = parseInt(id!, 10);
        if (isNaN(parsedId)) { navigate('/admin/organizer-activities', { replace: true }); return; }

        context.getOrganizerActivity(parsedId).then(data => {
            if (!data) { navigate('/admin/organizer-activities', { replace: true }); return; }
            setFormData({ title: data.title });
            setLocalLoading(false);
        }).catch(() => setLocalLoading(false));
    }, [id, navigate, isEdit]);

    if (localLoading) return (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Adatok betöltése...</p>
        </div>
    );

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async () => {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/organizer-activity/${id}` : '/organizer-activity';

        try {
            const response = await adminApiRequest(url, {
                method,
                body: JSON.stringify(formData)
            });
            isEdit
                ? context.updateOrganizerActivityInCache(response)
                : context.addOrganizerActivityToCache(response);
            navigate('/admin/organizer-activities');
        } catch {
            showToast('Hiba történt a mentés közben.', 'error');
            throw new Error();
        }
    };

    return (
        <AdminForm
            title={isEdit ? 'Szervezői tevékenység szerkesztése' : 'Új szervezői tevékenység'}
            onSubmit={handleSubmit}
        >
            <AdminFormCard>
                <Input
                    label="Megnevezés"
                    value={formData.title}
                    onChange={(e: any) => setFormData({ title: e.target.value })}
                    required
                />
            </AdminFormCard>
        </AdminForm>
    );
};
