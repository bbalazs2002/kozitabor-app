import { useLocation } from "react-router-dom";
import { InfoCard } from "../../components/core/InfoCard"
import { Info } from 'lucide-react';
import { useDb } from "../../context/core/DbContext";
import {type Info as InfoType} from "../../types/database"
import DynamicIcon from "../../components/core/DynamicIcon";
import { useEffect, useState } from "react";
import { CardItem } from "../../components/core/CardItem";
import { useTheme } from "../../context/core/ThemeContext";

const InfoBlock: React.FC = () =>  {
    // style
    const {colors} = useTheme();

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
            title="Fontos Infók"
            icon={Info}
            buttonText={ isHomePage ? 'További infók' : undefined }
            buttonTo="/info"
        >
            <div className="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
                {latestInfos.map((info) => (
                    <CardItem
                        key={info.id}
                        to={`/info/${info.id}`}
                        icon={<DynamicIcon
                            name={info.icon}
                            size={22}
                            color={colors.icon}
                            className="mr-3"
                        />}
                        className="px-2"
                    >
                        <span>{info.title}</span>
                    </CardItem>
                ))}
            </div>
        </InfoCard>
    )
};

export default InfoBlock;