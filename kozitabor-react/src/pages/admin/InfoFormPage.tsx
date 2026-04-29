import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Loader2, Paperclip, Trash2, X } from 'lucide-react';
import { IconPicker, Input, TextArea } from '../../components/admin/FormInputs';
import { MapFields } from '../../components/admin/MapFields';
import { useDb } from '../../context/admin/DbContext';
import type { InfoData, MapData } from '../../types/forms';
import type { Media } from '../../types/database';
import { adminApiRequest, getMediaUrl } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';

const InfoFormPage = () => {
    const emptyForm: InfoData = { title: "", content: "", icon: "" };
    const emptyMap: MapData = { show: false, lat: 47.497, lng: 19.040, zoom: 15 };

    const [formData, setFormData] = useState<InfoData>(emptyForm);
    const [mapData, setMapData] = useState<MapData>(emptyMap);
    const [existingMedia, setExistingMedia] = useState<Media[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [localLoading, setLocalLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { showToast } = useToast();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useDb();
    const isEdit = id !== undefined && id !== 'new';

    // Blob URL-ek lifecycle kezelése: minden file-változáskor újra generálja és felszabadítja
    useEffect(() => {
        const urls = newFiles.map(f => f.type.startsWith('image/') ? URL.createObjectURL(f) : '');
        setPreviews(urls);
        return () => { urls.forEach(url => url && URL.revokeObjectURL(url)); };
    }, [newFiles]);

    useEffect(() => {
        if (!isEdit) { setLocalLoading(false); return; }

        const parsedId = parseInt(id!, 10);
        if (isNaN(parsedId)) { navigate('/admin/infos', { replace: true }); return; }

        const fetchLatest = async () => {
            try {
                setLocalLoading(true);
                const data = await context.getInfo(parsedId);
                if (!data) { navigate('/admin/infos', { replace: true }); return; }
                setFormData({ title: data.title, content: data.content ?? "", icon: data.icon });
                if (data.map) setMapData({ show: true, lat: data.map.lat, lng: data.map.lng, zoom: data.map.zoom });
                setExistingMedia(data.media ?? []);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
    }, [id, navigate, isEdit]);

    if (localLoading) return (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Adatok betöltése...</p>
        </div>
    );

    const addFiles = (fileList: FileList | File[]) => {
        const accepted = Array.from(fileList).filter(
            f => f.type.startsWith('image/') || f.type === 'application/pdf'
        );
        if (accepted.length > 0) setNewFiles(prev => [...prev, ...accepted]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(e.target.files);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleDeleteMedia = (mediaId: number) => {
        setDeletedMediaIds(prev =>
            prev.includes(mediaId) ? prev.filter(i => i !== mediaId) : [...prev, mediaId]
        );
    };

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async () => {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `/info/${id}` : '/info';

        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('content', formData.content);
        fd.append('icon', formData.icon);
        fd.append('map', JSON.stringify(mapData));
        if (isEdit && deletedMediaIds.length > 0) {
            fd.append('deletedMediaIds', JSON.stringify(deletedMediaIds));
        }
        newFiles.forEach(f => fd.append('files', f));

        try {
            const response = await adminApiRequest(url, { method, body: fd });
            isEdit ? context.updateInfoInCache(response) : context.addInfoToCache(response);
            navigate('/admin/infos');
        } catch (error) {
            showToast("Hiba történt a mentés közben.", "error");
            throw error;
        }
    };

    const visibleExisting = existingMedia.filter(m => !deletedMediaIds.includes(m.id));
    const markedForDelete = existingMedia.filter(m => deletedMediaIds.includes(m.id));

    return (
        <AdminForm
            title={isEdit ? 'Kártya szerkesztése' : 'Új kártya létrehozása'}
            onSubmit={handleSubmit}
        >
            <AdminFormCard>
                <Input
                    label="Kártya megnevezése"
                    placeholder="Pl: Regisztráció menete"
                    value={formData.title}
                    onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                <TextArea
                    label="HTML Tartalom"
                    placeholder="<p>Írd ide a leírást...</p>"
                    value={formData.content}
                    onChange={(e: any) => setFormData({ ...formData, content: e.target.value })}
                    required
                />
            </AdminFormCard>

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

            <AdminFormCard title="Csatolt fájlok">
                {/* Meglévő fájlok (szerkesztés módban) */}
                {visibleExisting.length > 0 && (
                    <div className="space-y-2">
                        {visibleExisting.map(media => (
                            <div key={media.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                {media.type === 'IMAGE'
                                    ? <img src={getMediaUrl(media.url)} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                                    : <div className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-lg flex-shrink-0"><FileText size={20} className="text-red-400" /></div>
                                }
                                <span className="text-sm text-gray-600 truncate flex-1">{media.url.split('/').pop()}</span>
                                <button
                                    type="button"
                                    onClick={() => toggleDeleteMedia(media.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Törlésre jelölt fájlok */}
                {markedForDelete.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wider ml-1">Törlésre jelölve</p>
                        {markedForDelete.map(media => (
                            <div key={media.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                                <span className="text-sm text-red-500 line-through truncate flex-1">{media.url.split('/').pop()}</span>
                                <button
                                    type="button"
                                    onClick={() => toggleDeleteMedia(media.id)}
                                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex-shrink-0"
                                >
                                    Visszaállítás
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Feltöltendő új fájlok */}
                {newFiles.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider ml-1">Feltöltendő</p>
                        {newFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                {file.type.startsWith('image/') && previews[index]
                                    ? <img src={previews[index]} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                                    : <div className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-lg flex-shrink-0"><FileText size={20} className="text-red-400" /></div>
                                }
                                <span className="text-sm text-gray-600 truncate flex-1">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeNewFile(index)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Drop zóna */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full flex flex-col items-center justify-center gap-1.5 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none
                        ${isDragOver
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                            : 'border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50'
                        }`}
                >
                    <Paperclip size={20} />
                    <span className="text-sm font-semibold">Húzd ide a fájlokat, vagy kattints a kiválasztáshoz</span>
                    <span className="text-xs">Kép vagy PDF, max. 5 MB</span>
                </div>
            </AdminFormCard>
        </AdminForm>
    );
};

export default InfoFormPage;
