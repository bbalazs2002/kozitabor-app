import React, { useEffect, useState } from 'react';
import { MapEmbed } from '../../components/core/MapEmbed';
import { useDb } from '../../context/core/DbContext';
import { type Info } from '../../types/database';
import { useParams } from 'react-router-dom';
import { ContentCard } from '../../components/core/ContentCard';

export const InfoDetails: React.FC = () => {
    const { infoId } = useParams();

    // DB
    const context = useDb();
    const [info, setInfo] = useState<Info>();
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = await context.getInfo(parseInt(String(infoId || "0"), 10));
                setInfo(data);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
    }, [context]);
    if (localLoading || !info) return <div>Töltés...</div>;

    return (
        <ContentCard title={info.title}>
            {/* CONTENT */}
            <div
                className="text-sm text-[#3e3028] dark:text-[#eaddca]/90 leading-relaxed font-montserrat space-y-4"
                dangerouslySetInnerHTML={{ __html: info.content ?? "" }}
            />

            {/* MAP */}
            {info.map !== null && <div className='mt-5'>
                <MapEmbed lat={info.map?.lat ?? 0} lng={info.map?.lng ?? 0} zoom={info.map?.zoom ?? 16} />
            </div>}
        </ContentCard>
    );
};