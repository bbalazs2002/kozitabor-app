import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Contact2Icon, Phone } from 'lucide-react';
import { InfoCard } from "../../components/core/InfoCard";
import { AccordionItem } from "../../components/core/AccordionItem";
import { useDb } from "../../context/core/DbContext";
import { useTheme } from "../../context/core/ThemeContext";
import type { Contact } from "../../types/database";

const ContactBlock: React.FC = () => {
    const { colors } = useTheme();

    const location = useLocation();
    const isHomePage = location.pathname === "/";

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

    return (
        <InfoCard
            title="Elérhetőségek"
            icon={Contact2Icon}
            loading={localLoading}
            buttonText={isHomePage ? 'További elérhetőségek' : undefined}
            buttonTo="/contacts"
        >
            {contacts.length === 0 ? (
                <p className="text-sm py-2" style={{ color: colors.text2 }}>
                    Nincs megjeleníthető kapcsolat.
                </p>
            ) : (
                contacts.map(contact => (
                    <AccordionItem
                        key={contact.id}
                        label={
                            <span className="flex items-center gap-2">
                                <span>{contact.name}</span>
                                {contact.role && (
                                    <span className="text-xs font-normal" style={{ color: colors.icon }}>
                                        {contact.role.name}
                                    </span>
                                )}
                            </span>
                        }
                    >
                        {contact.tel ? (
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="shrink-0" style={{ color: colors.icon }} />
                                <span className="text-sm flex-1" style={{ color: colors.text2 }}>
                                    {contact.tel}
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm" style={{ color: colors.text2, opacity: 0.6 }}>
                                Nincs telefonszám megadva.
                            </p>
                        )}
                    </AccordionItem>
                ))
            )}
        </InfoCard>
    );
};

export default ContactBlock;
