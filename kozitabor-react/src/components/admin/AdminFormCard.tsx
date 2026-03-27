interface CardProps {
    title?: string;
    children: React.ReactNode;
}

export const AdminFormCard: React.FC<CardProps> = ({title, children}) => {
    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                {title && <h3 className="font-bold text-gray-800 border-b pb-3">{title}</h3>}
                {children}
            </div>
        </div>
    );
}