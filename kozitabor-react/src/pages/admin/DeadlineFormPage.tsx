import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Input } from '../../components/admin/FormInputs';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';
import { useDb } from '../../context/admin/DbContext';
import { useToast } from '../../context/admin/ToastContext';
import { adminApiRequest } from '../../utils/api';
import type { DeadlineData } from '../../types/forms';

const toDateInputValue = (date: string | Date): string => {
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const DeadlineFormPage = () => {
    const [formData, setFormData] = useState<DeadlineData>({ label: '', date: '' });
    const [localLoading, setLocalLoading] = useState(true);

    const { showToast } = useToast();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useDb();
    const isEdit = id !== undefined && id !== 'new';

    useEffect(() => {
        if (!isEdit) { setLocalLoading(false); return; }

        const parsedId = parseInt(id!, 10);
        if (isNaN(parsedId)) { navigate('/admin/deadlines', { replace: true }); return; }

        context.getDeadline(parsedId).then(data => {
            if (!data) { navigate('/admin/deadlines', { replace: true }); return; }
            setFormData({ label: data.label, date: toDateInputValue(data.date) });
            setLocalLoading(false);
        }).catch(() => setLocalLoading(false));
    }, [id, isEdit]);

    if (localLoading) return (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Adatok betöltése...</p>
        </div>
    );

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async () => {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/deadline/${id}` : '/deadline';

        try {
            const response = await adminApiRequest(url, {
                method,
                body: JSON.stringify(formData),
            });
            isEdit
                ? context.updateDeadlineInCache(response)
                : context.addDeadlineToCache(response);
            navigate('/admin/deadlines');
        } catch {
            showToast('Hiba történt a mentés közben.', 'error');
            throw new Error();
        }
    };

    return (
        <AdminForm
            title={isEdit ? 'Határidő szerkesztése' : 'Új határidő'}
            onSubmit={handleSubmit}
        >
            <AdminFormCard>
                <Input
                    label="Megnevezés"
                    value={formData.label}
                    onChange={(e: any) => setFormData({ ...formData, label: e.target.value })}
                    required
                />
                <Input
                    label="Dátum"
                    type="date"
                    value={formData.date}
                    onChange={(e: any) => setFormData({ ...formData, date: e.target.value })}
                    required
                />
            </AdminFormCard>
        </AdminForm>
    );
};

export default DeadlineFormPage;
