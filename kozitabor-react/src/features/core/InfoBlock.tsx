import { useLocation } from "react-router-dom";
import { InfoCard } from "../../components/core/InfoCard"
import { InfoCardItemIcon } from "../../components/core/InfoCardItemIcon"
import { Info } from 'lucide-react';
import { useDb } from "../../context/core/DbContext";
import {type Info as InfoType} from "../../types/database"
import DynamicIcon from "../../components/core/DynamicIcon";
import { useEffect, useState } from "react";

const InfoBlock: React.FC = () =>  {
    // Router path
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    // DB
    const context = useDb();
    const [latestInfos, setLatestInfos] = useState<InfoType[]>([]);
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = isHomePage ? await context.getNInfos(3) : await context.getInfos();
                setLatestInfos(data);
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
            title='Fontos Infók' 
            icon={Info} 
            buttonText={isHomePage ? 'További infók' : undefined} 
            buttonColor='#4e7a3a'
            buttonTo='/info'
        >
            {latestInfos.map((info) => (
            <InfoCardItemIcon 
                key={info.id}
                icon={<DynamicIcon name={info.icon} size={22} className="mr-3 text-[#5d4037] dark:text-[#d4af37]" />} 
                to={`/info/${info.id}`}
            >
                {info.title}
            </InfoCardItemIcon>
            ))}
        </InfoCard>
    )};

export default InfoBlock;