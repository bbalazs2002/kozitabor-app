import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';
import { Input, Select } from '../../components/admin/FormInputs';
import type { ContactData } from '../../types/forms';
import type { Role } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import { Loader2 } from 'lucide-react';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';

export const ContactFormPage = () => {
    const emptyForm: ContactData = { name: "", tel: "", roleId: null };

    const [formData, setFormData] = useState<ContactData>(emptyForm);
    const [roles, setRoles] = useState<Role[]>([]);
    const [localLoading, setLocalLoading] = useState(true);

    const { showToast } = useToast();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useDb();
    const isEdit = id !== undefined && id !== 'new';

    useEffect(() => {
        const load = async () => {
            try {
                // Szerepkörök betöltése mindig szükséges
                const fetchedRoles = await context.getRoles();
                setRoles(fetchedRoles);

                if (!isEdit) { setLocalLoading(false); return; }

                const parsedId = parseInt(id!, 10);
                if (isNaN(parsedId)) { navigate('/admin/contacts', { replace: true }); return; }

                const data = await context.getContact(parsedId);
                if (!data) { navigate('/admin/contacts', { replace: true }); return; }

                setFormData({
                    name: data.name,
                    tel: data.tel ?? "",
                    roleId: data.role?.id ?? null
                });
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        load();
    }, [id, navigate, isEdit]);

    if (localLoading) return (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Adatok betöltése...</p>
        </div>
    );

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async () => {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/contact/${id}` : '/contact';

        try {
            const response = await adminApiRequest(url, {
                method,
                body: JSON.stringify({
                    name: formData.name,
                    tel: formData.tel,
                    roleId: formData.roleId ?? null
                })
            });

            isEdit ? context.updateContactInCache(response) : context.addContactToCache(response);
            navigate('/admin/contacts');
        } catch (error) {
            showToast("Hiba történt a mentés közben.", "error");
            throw error;
        }
    };

    return (
        <AdminForm
            title={isEdit ? 'Kontakt szerkesztése' : 'Új kontakt hozzáadása'}
            onSubmit={handleSubmit}
        >
            <AdminFormCard>
                <Input
                    label="Név"
                    value={formData.name}
                    onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <Input
                    label="Telefonszám"
                    type="tel"
                    value={formData.tel}
                    onChange={(e: any) => setFormData({ ...formData, tel: e.target.value })}
                    placeholder="+36 30 123 4567"
                />
                <Select
                    label="Szerepkör"
                    value={formData.roleId?.toString() ?? ""}
                    onChange={(e: any) => setFormData({
                        ...formData,
                        roleId: e.target.value ? Number(e.target.value) : null
                    })}
                    options={roles}
                />
            </AdminFormCard>
        </AdminForm>
    );
};
