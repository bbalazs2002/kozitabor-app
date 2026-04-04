import { useLocation } from "react-router-dom";
import { InfoCard } from "../../components/core/InfoCard"
import { Check, CheckCheckIcon } from 'lucide-react';
import { useDb } from "../../context/core/DbContext";
import { useEffect, useState } from "react";
import type { Bring } from "../../types/database";
import { CardItem } from "../../components/core/CardItem";
import { useTheme } from "../../context/core/ThemeContext";

const WhatToBringBlock: React.FC = () => {
    // style
    const {colors} = useTheme();

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
            title="Mit hozz?"
            icon={CheckCheckIcon}
            buttonText={isHomePage ? 'Teljes lista' : undefined}
            buttonTo="/whatToBring"
        >
            <div className="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
                {items.map(item => (
                    <CardItem key={item.id} icon={<Check color={colors.icon} />} className="px-2">
                        {item.title}
                    </CardItem>
                ))}
            </div>
        </InfoCard>
)};

export default WhatToBringBlock;