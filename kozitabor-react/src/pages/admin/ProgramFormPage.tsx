import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, NoonDatePicker, TextArea, TimeOffsetPicker } from '../../components/admin/FormInputs';
import { useDb } from '../../context/admin/DbContext';
import type { ProgramData } from '../../types/forms';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';
import { getTodayNoon, normalizeToUtcNoon } from '../../utils/dateHelpers';
import { Loader2 } from 'lucide-react';

const ProgramFormPage = () => {
    // Default content
    const emptyForm: ProgramData = {
        title: "",
        desc: "",
        startDay: getTodayNoon(),
        endDay: getTodayNoon(),
        startTimeOffset: 43200,
        endTimeOffset: 43200
    };

    // States
    const [formData, setFormData] = useState<ProgramData>(emptyForm);
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
            navigate('/admin/programs', { replace: true });
            return;
        }

        // 3. Adatlekérés
        const fetchLatest = async () => {
            try {
                setLocalLoading(true);
                const data = await context.getProgram(parsedId);
                
                if (!data) {
                    // Ha a szám stimmel, de a DB-ben nincs ilyen rekord
                    navigate('/admin/programs', { replace: true });
                    return;
                }

                // 4. Form adatok beállítása a séma szerint
                setFormData({
                    title: data.title,
                    desc: data.desc ?? "",
                    startDay: normalizeToUtcNoon(data.startDay),
                    endDay: normalizeToUtcNoon(data.endDay),
                    startTimeOffset: data.startTimeOffset,
                    endTimeOffset: data.endTimeOffset
                });

                // Ha van ikon vagy egyéb mező a sémában, azt is itt állítsd be
                // setIcon(data.icon); 

            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
                // Opcionálisan: navigate('/admin/programs');
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
        // A context.getProgram-ot is érdemes felvenni a függőségek közé, ha stabil a referenciája
    }, [id, navigate, isEdit, context]);

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
        const url = isEdit ? `/program/${id}` : '/program';

        try {
            const response = await adminApiRequest(url, {
                method,
                body: JSON.stringify({
                    ...formData
                })
            });

            // success
            isEdit ? context.updateProgramInCache(response) : context.addProgramToCache(response);
            navigate('/admin/programs'); 
            
        } catch (error) {
            console.error("Mentési hiba:", error);
            showToast("Hiba történt a mentés közben.", "error");
            throw(error);
        }
    };

    // Main component
    return (
        <AdminForm
            title={ isEdit ? 'Program szerkesztése' : 'Új program létrehozása' }
            onSubmit={handleSubmit}
        >
            <AdminFormCard>
                <Input 
                    label="Cím" 
                    value={formData.title}
                    onChange={(e: any) => setFormData({...formData, title: e.target.value})}
                    required
                />
                <TextArea 
                    label="Leírás" 
                    placeholder="Írd ide a leírást..."
                    value={formData.desc}
                    onChange={(e: any) => setFormData({...formData, desc: e.target.value})}
                />
            </AdminFormCard>

            <AdminFormCard
                title="Program kezdete"
            >
                <NoonDatePicker
                    label='Nap'
                    value={formData.startDay}
                    onChange={date => setFormData({...formData, startDay: date})}
                /> 
                <TimeOffsetPicker
                    label='Időpont'
                    offset={formData.startTimeOffset}
                    onChange={time => setFormData({...formData, startTimeOffset: time})}
                />
            </AdminFormCard>

            <AdminFormCard
                title="Program vége"
            >
                <NoonDatePicker
                    label='Nap'
                    value={formData.endDay}
                    onChange={date => setFormData({...formData, endDay: date})}
                /> 
                <TimeOffsetPicker
                    label='Időpont'
                    offset={formData.endTimeOffset}
                    onChange={time => setFormData({...formData, endTimeOffset: time})}
                />
            </AdminFormCard>
        </AdminForm>
    );
};

export default ProgramFormPage;