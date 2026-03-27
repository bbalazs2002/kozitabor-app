import { useLocation } from "react-router-dom";
import { InfoCard } from "../../components/core/InfoCard"
import { InfoCardItemIcon } from "../../components/core/InfoCardItemIcon"
import { Check, CheckCheckIcon } from 'lucide-react';
import { useDb } from "../../context/core/DbContext";
import { useEffect, useState } from "react";
import type { Bring } from "../../types/database";

const WhatToBringBlock: React.FC = () => {
    // Router path
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    // DB
    const context = useDb();
    const [items, setItems] = useState<Bring[]>([]);
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = isHomePage ? await context.getNBring(3) : await context.getBring();
                setItems(data);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
    }, [context]);
    if (localLoading) return <div>Betöltés...</div>;
    
    return (
        <InfoCard 
            title='Mit hozz?' 
            icon={CheckCheckIcon} 
            buttonColor='#4e7a3a' 
            buttonText={isHomePage ? 'Teljes lista' : undefined} 
            buttonTo="/whatToBring">
            {items.map(item => 
                <InfoCardItemIcon key={item.id} icon={<Check/>}>{item.title}</InfoCardItemIcon>
            )}
        </InfoCard>
)};

export default WhatToBringBlock;