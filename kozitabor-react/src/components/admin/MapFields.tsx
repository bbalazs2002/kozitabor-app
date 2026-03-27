import React from 'react';
import { Input, Checkbox } from './FormInputs';
import { Globe } from 'lucide-react';
import type { MapData } from '../../types/forms';

interface MapFieldsProps {
    data: MapData;
    onChange: (newData: MapData) => void;
}

export const MapFields: React.FC<MapFieldsProps> = ({ data, onChange }) => {
    
    // Segédfüggvény a számok kezeléséhez
    const handleNumberChange = (field: keyof MapData, value: string) => {
        const numValue = value === '' ? 0 : parseFloat(value);
        onChange({ ...data, [field]: numValue });
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        onChange({
            ...data,
            show: isChecked,
            lat: data.lat,
            lng: data.lng,
            zoom: data.zoom,
        });
    };

    return (
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4 transition-all duration-300">
            <Checkbox 
                label="Térkép megjelenítése" 
                checked={data.show} 
                onChange={handleToggle} 
            />

            {data.show && (
                <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Globe size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Helyszín adatok</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Szélesség (Lat)" 
                            type="number" 
                            step="any"
                            value={data.lat}
                            onChange={(e: any) => handleNumberChange('lat', e.target.value)}
                        />
                        <Input 
                            label="Hosszúság (Lng)" 
                            type="number" 
                            step="any"
                            value={data.lng}
                            onChange={(e: any) => handleNumberChange('lng', e.target.value)}
                        />
                    </div>
                    
                    <Input 
                        label="Nagyítás (Zoom)" 
                        type="number" 
                        min={1} 
                        max={22}
                        value={data.zoom}
                        onChange={(e: any) => handleNumberChange('zoom', e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};