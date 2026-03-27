import { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import DynamicIcon from './DynamicIcon';

interface MultiSelectItem {
    id: number;
    name?: string;
    title?: string;
}

interface MultiSelectProps {
    label: string;
    options: MultiSelectItem[];
    selectedIds: number[];
    onChange: (newIds: number[]) => void;
    placeholder?: string;
    icon?: string;
}

export const MultiSelect = ({ label, options, selectedIds, onChange, icon = "UserPlus", placeholder = "Keresés..." }: MultiSelectProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Kívülre kattintás figyelése a lista bezárásához
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getItemLabel = (item: MultiSelectItem) => item.name || item.title || `Elem #${item.id}`;

    // Szűrés: ne legyen benne a kiválasztott, és egyezzen a keresőszóval
    const filteredOptions = options.filter(opt => 
        !selectedIds.includes(opt.id) && 
        getItemLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (id: number) => {
        onChange([...selectedIds, id]);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleRemove = (id: number) => {
        onChange(selectedIds.filter(itemId => itemId !== id));
    };

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="block text-sm font-bold text-gray-700 ml-1">{label}</label>
            
            <div className="space-y-3">
                {/* Keresőmező és Konténer */}
                <div className="relative">
                    <div className={`
                        flex items-center gap-2 px-4 py-2.5 bg-gray-50 border rounded-2xl transition-all
                        ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-50 shadow-sm' : 'border-gray-200'}
                    `}>
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            className="bg-transparent border-none outline-none w-full text-gray-700 placeholder:text-gray-400"
                            placeholder={placeholder}
                            value={searchTerm}
                            onFocus={() => setIsOpen(true)}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Lebegő találati lista */}
                    {isOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleSelect(opt.id)}
                                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-between group"
                                    >
                                        <span className="text-gray-700 group-hover:text-indigo-700">{getItemLabel(opt)}</span>
                                        <DynamicIcon 
                                            name={icon}
                                            size={16}
                                            className="text-gray-300 group-hover:text-indigo-500"
                                         />
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-400 text-sm italic">
                                    Nincs találat a keresésre.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Kiválasztott "Chipek" */}
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {selectedIds.map(id => {
                        const item = options.find(opt => opt.id === id);
                        if (!item) return null;
                        return (
                            <div 
                                key={id} 
                                className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium shadow-sm"
                            >
                                <span>{getItemLabel(item)}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(id)}
                                    className="hover:bg-indigo-500 p-0.5 rounded-full transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};