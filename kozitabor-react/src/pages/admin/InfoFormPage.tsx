import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { IconPicker, Input, TextArea } from '../../components/admin/FormInputs';
import { MapFields } from '../../components/admin/MapFields';
import { useDb } from '../../context/admin/DbContext';
import type { InfoData, MapData } from '../../types/forms';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';

const InfoFormPage = () => {
    // default content
    const emptyForm: InfoData = {
        title: "",
        content: "",
        icon: ""
    };
    const emptyMap: MapData = {
        show: false,
        lat: 47.497,
        lng: 19.040,
        zoom: 15
    };

    // States
    const [formData, setFormData] = useState<InfoData>(emptyForm);
    const [mapData, setMapData] = useState<MapData>(emptyMap);
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
            navigate('/admin/infos', { replace: true });
            return;
        }

        // 3. Adatlekérés
        const fetchLatest = async () => {
            try {
                setLocalLoading(true);
                const data = await context.getInfo(parsedId);
                if (!data) {
                    // Ha a szám stimmel, de a DB-ben nincs ilyen rekord
                    navigate('/admin/infos', { replace: true });
                    return;
                }
                setFormData({
                    title: data.title,
                    content: data.content ?? "",
                    icon: data.icon
                });
                if (data.map) {
                    setMapData({
                        show: true,
                        lat: data.map.lat,
                        lng: data.map.lng,
                        zoom: data.map.zoom
                    });
                }
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
        const url = isEdit ? `/info/${id}` : '/info';

        try {
            const response = await adminApiRequest(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    map: { ...mapData }
                })
            });

            // success
            isEdit ? context.updateInfoInCache(response) : context.addInfoToCache(response);
            navigate('/admin/infos'); 
            
        } catch (error) {
            console.error("Mentési hiba:", error);
            showToast("Hiba történt a mentés közben.", "error");
            throw(error);
        }
    };

    // Main component
    return (
        <AdminForm
            title={isEdit ? 'Kártya szerkesztése' : 'Új kártya létrehozása'}
            onSubmit={handleSubmit}
        >
            {/* Bal oszlop: Fő adatok */}
            <AdminFormCard>
                <Input 
                    label="Kártya megnevezése" 
                    placeholder="Pl: Regisztráció menete"
                    value={formData ? formData.title : ""}
                    onChange={(e: any) => setFormData({...formData, title: e.target.value})}
                    required
                />
                <TextArea 
                    label="HTML Tartalom" 
                    placeholder="<p>Írd ide a leírást...</p>"
                    value={formData.content}
                    onChange={(e: any) => setFormData({...formData, content: e.target.value})}
                    required
                />
            </AdminFormCard>

            {/* Jobb oszlop: Beállítások */}
            <AdminFormCard title="Egyéb beállítások">
                <IconPicker
                    label="Megjelenő Ikon" 
                    value={formData.icon} 
                    onChange={(newIcon: string) => setFormData({ ...formData, icon: newIcon })} 
                />

                <MapFields 
                    data={mapData}
                    onChange={(mapData: MapData) => setMapData(mapData)} 
                />
            </AdminFormCard>
        </AdminForm>
    );
};

export default InfoFormPage;