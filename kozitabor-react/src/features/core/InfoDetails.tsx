import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { MapEmbed } from '../../components/core/MapEmbed';
import { useDb } from '../../context/core/DbContext';
import { type Info } from '../../types/database';
import { useParams } from 'react-router-dom';
import { ContentCard } from '../../components/core/ContentCard';
import { getMediaUrl } from '../../utils/api';

interface InfoDetailsProps {
    infoId?: number;
}

export const InfoDetails: React.FC<InfoDetailsProps> = ({ infoId: infoIdProp }) => {
    const { infoId: infoIdParam } = useParams();
    const infoId = infoIdProp ?? parseInt(String(infoIdParam || "0"), 10);

    // DB
    const context = useDb();
    const [info, setInfo] = useState<Info>();
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = await context.getInfo(infoId);
                setInfo(data);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
    }, [context, infoId]);
    if (localLoading || !info) return <div>Töltés...</div>;

    return (
        <ContentCard title={info.title}>
            {/* CONTENT */}
            <div
                className="text-sm text-[#3e3028] dark:text-[#eaddca]/90 leading-relaxed font-montserrat space-y-4"
                dangerouslySetInnerHTML={{ __html: info.content ?? "" }}
            />

            {/* MEDIA */}
            {info.media && info.media.length > 0 && (
                <div className="mt-5 space-y-3">
                    {info.media.map(media => (
                        media.type === 'IMAGE'
                            ? <img key={media.id} src={getMediaUrl(media.url)} alt="" className="w-full rounded-xl" />
                            : <a key={media.id} href={getMediaUrl(media.url)} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
                                <FileText size={18} className="text-red-400 flex-shrink-0" />
                                <span className="truncate">{media.url.split('/').pop()}</span>
                              </a>
                    ))}
                </div>
            )}

            {/* MAP */}
            {info.map !== null && <div className='mt-5'>
                <MapEmbed lat={info.map?.lat ?? 0} lng={info.map?.lng ?? 0} zoom={info.map?.zoom ?? 16} />
            </div>}
        </ContentCard>
    );
};