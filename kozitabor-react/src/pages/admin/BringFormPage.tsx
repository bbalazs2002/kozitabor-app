import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';
import { Input } from '../../components/admin/FormInputs';
import { type BringData } from '../../types/forms';
import { useDb } from '../../context/admin/DbContext';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';

export const BringFormPage = () => {
    // Default content
    const emptyForm: BringData = {
        title: ""
    };

    // States
    const [formData, setFormData] = useState<BringData>(emptyForm);

    // Toast message
    const { showToast } = useToast();

    // Other variables
    const navigate = useNavigate();
    const context = useDb();

    // Form submit handler
    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async () => {

        const method = 'POST';
        const url = '/bring';

        try {
            const response = await adminApiRequest(url, {
                method,
                body: JSON.stringify({
                    ...formData
                })
            });

            // success
            context.addBringToCache(response);
            navigate('/admin/brings'); 
            
        } catch (error) {
            console.error("Mentési hiba:", error);
            showToast("Hiba történt a mentés közben.", "error");
            throw error;
        }
    };

    // Main component
    return (
        <AdminForm
            title={'Új elem hozzáadása'}
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