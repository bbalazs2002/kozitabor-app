import { ArrowLeft, Loader2, Save } from "lucide-react"
import AdminButton from "./AdminButton"
import { useState } from "react";

interface FormProps {
    title: string;
    onSubmit: React.SubmitEventHandler<HTMLFormElement>;
    children: React.ReactNode;
}

export const AdminForm: React.FC<FormProps> = ({title, onSubmit, children}) => {
    const [saving, setSaving] = useState(false);
    const submitHandler: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        setSaving(true);
        try {
            await onSubmit(e);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }
    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Vissza gomb és Cím */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                <AdminButton
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="p-2 px-2 rounded-full border-none shadow-none hover:bg-white"
                >
                    <ArrowLeft size={24} />
                </AdminButton>
                <h1 className="text-3xl font-black text-gray-900">
                    {title}
                </h1>
                </div>
            </div>

            <form onSubmit={submitHandler} className="grid grid-cols-1 gap-8">
                {children}

                <div className="flex flex-col gap-3">
                    <AdminButton 
                        type="submit" 
                        disabled={saving}
                        className="w-full py-4 text-lg shadow-xl shadow-indigo-100"
                        icon={saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    >
                        {saving ? 'Mentés folyamatban...' : 'Változtatások mentése'}
                    </AdminButton>
                    
                    <AdminButton 
                        onClick={() => window.history.back()}
                        variant="outline" 
                        className="w-full py-3"
                    >
                        Mégse
                    </AdminButton>
                </div>
            </form>
        </div>
    )
};