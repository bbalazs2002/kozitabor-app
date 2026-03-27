import React from 'react';
import AdminButton from './AdminButton';
import { Pencil, Trash2 } from 'lucide-react';

interface CardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    id: string;
    icon: React.ReactNode;
    title: string;
    info?: React.ReactNode;
    editAction?: () => void;
    deleteAction?: () => void;
}

const ListCard: React.FC<CardProps> = ({id, icon, title, info, editAction, deleteAction}) => {
  return (
    <div 
        key={id}
        className="group bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
        {/* Bal oldal: Ikon és Szöveg */}
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {icon}
                {/* <DynamicIcon name={icon} size={24} /> */ }
            </div>
            <div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{title}</h3>
                <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">ID: #{id}</span>
                {info ?? ""}
                </div>
            </div>
        </div>

        {/* Jobb oldal: Műveletek */}
        { (editAction || deleteAction) &&
            <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                <span className="md:hidden text-xs text-gray-400 font-medium">Műveletek:</span>
                <div className="flex gap-2">
                    { editAction && <AdminButton 
                        onClick={editAction}
                        variant="outline" 
                        icon={<Pencil size={16} />}
                        className="rounded-full w-10 h-10 p-0 md:w-auto md:h-auto md:px-4 md:py-2 md:rounded-lg"
                    >
                        <span className="hidden md:inline">Szerkesztés</span>
                    </AdminButton> }
                    
                    { deleteAction && <AdminButton 
                        variant="danger" 
                        icon={<Trash2 size={16} />}
                        className="rounded-full w-10 h-10 p-0 md:w-auto md:h-auto md:px-4 md:py-2 md:rounded-lg"
                        onClick={deleteAction}
                    >
                        <span className="hidden md:inline">Törlés</span>
                    </AdminButton> }
                </div>
            </div>
        }
    </div>
  );
};

export default ListCard;