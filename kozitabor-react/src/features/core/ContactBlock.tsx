import { useLocation } from "react-router-dom";
import { InfoCard } from "../../components/core/InfoCard"
import { InfoCardItemIcon } from "../../components/core/InfoCardItemIcon"
import { Contact2Icon } from 'lucide-react';
import { useDb } from "../../context/core/DbContext";
import { type Contact } from "../../types/database"
import DynamicIcon from "../../components/core/DynamicIcon";
import { useEffect, useState } from "react";

const ContactBlock: React.FC = () =>  {
    // Router path
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    // DB
    const context = useDb();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = isHomePage ? await context.getNContacts(3) : await context.getContacts();
                setContacts(data);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
    }, [context]);
    if (localLoading) return <div>Betöltés...</div>;
    
    // Component
    return (
        <InfoCard 
            title='Kapcsolatok' 
            icon={Contact2Icon} 
            buttonText={isHomePage ? 'További kapcsolatok' : undefined} 
            buttonColor='#4e7a3a'
            buttonTo='/contacts'
        >
            {contacts.map((contact) => (
            <InfoCardItemIcon 
                key={contact.id}
                icon={<DynamicIcon name="Phone" size={22} className="mr-3 text-[#5d4037] dark:text-[#d4af37]" />}
            >
                <span>{contact.name}</span>
                <span>{contact.tel}</span>
            </InfoCardItemIcon>
            ))}
        </InfoCard>
    )};

export default ContactBlock;