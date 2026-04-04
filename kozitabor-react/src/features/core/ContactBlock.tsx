import { useLocation } from "react-router-dom";
import { InfoCard } from "../../components/core/InfoCard"
import { Contact2Icon, Phone } from 'lucide-react';
import { useDb } from "../../context/core/DbContext";
import { type Contact } from "../../types/database"
import { useEffect, useState } from "react";
import { CardItem } from "../../components/core/CardItem";
import { useTheme } from "../../context/core/ThemeContext";

const ContactBlock: React.FC = () =>  {
    // style
    const {colors} = useTheme();

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
            title="Kapcsolatok"
            icon={Contact2Icon}
            buttonText={isHomePage ? 'További kapcsolatok' : undefined}
            buttonTo="/contacts"
        >
        <div className="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
            {contacts.map((contact) => (
            <CardItem
                key={contact.id}
                to={contact.tel ? `tel:${contact.tel}` : undefined}
                icon={<Phone color={colors.icon} />}
                className="px-2"
            >
                <span>{contact.name}</span>
                <span>{contact.tel}</span>
            </CardItem>
            ))}
        </div>
        </InfoCard>
    )};

export default ContactBlock;