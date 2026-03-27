import React, { useEffect, useState } from 'react';
import { useDb } from '../../context/core/DbContext';
import { type Program } from '../../types/database';
import { useParams } from 'react-router-dom';
import { ContentCard } from '../../components/core/ContentCard';
import { formatOffsetToTime, getDayDate } from '../../utils/dateHelpers';

export const ProgramDetails: React.FC = () => {
    const { progId } = useParams();

    // DB
    const context = useDb();
    const [prog, setProg] = useState<Program>();
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = await context.getProgram(parseInt(String(progId || "0"), 10));
                setProg(data);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
    }, [context]);
    if (localLoading || !prog) return <div>Töltés...</div>;

    return (
        <ContentCard title={prog.title}>
            {/* TIME */}
            <p className='text-[#3e3028]'>
                <span className="text-lg font-bold">Kezdés: </span>
                {`${getDayDate(prog.startDay)} ${formatOffsetToTime(prog.startTimeOffset)}`}
            </p>
            <p className='text-[#3e3028] mb-5'>
                <span className="text-lg font-bold">Befejezés: </span>
                {`${getDayDate(prog.endDay)} ${formatOffsetToTime(prog.endTimeOffset)}`}
            </p>

            {/* CONTENT */}
            <div
                className="text-sm text-[#3e3028] dark:text-[#eaddca]/90 leading-relaxed font-montserrat space-y-4"
                dangerouslySetInnerHTML={{ __html: prog.desc ?? "" }}
            />
        </ContentCard>
    );
};