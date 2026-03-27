import React from 'react';
import { useLivePrograms } from '../../hooks/useLiveProgram';
import { formatOffsetToTime } from '../../utils/dateHelpers';

export const StatusHeader: React.FC = () => {
    const now = new Date();
    const dayName = new Intl.DateTimeFormat('hu-HU', { weekday: 'long' })
        .format(now)
        .toUpperCase();
    const dayNumeric = new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric' })
        .format(now)
        .toUpperCase();

    const { data } = useLivePrograms(30000);

    return (
        <div className="relative z-10 w-full max-w-[25rem] flex justify-between items-center 
                        rounded-[1.5rem] border-2 border-[#C5A059] p-4 mb-5 shadow-xl
                        bg-gradient-to-b from-[#8B2622] to-[#561412] text-[#f4e4bc]
                        dark:from-[#1a120d] dark:to-[#000000] dark:text-[#C5A059]">
            <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
                <span className="text-[0.7rem] opacity-80 font-bold uppercase tracking-wider">Éppen most:</span>
                <span className="text-xl font-cinzel">{data.current ? data.current.title : ''}</span>
            </div>
            <div className="flex items-baseline gap-2 opacity-90">
                <span className="text-[0.6rem] font-bold uppercase tracking-wider text-white/70 dark:text-[#C5A059]/70">Ezután:</span>
                <span className="text-sm font-cinzel">{data.next ? `${data.next?.title} - ${formatOffsetToTime(data.next ? data.next.startTimeOffset : 0)}` : 'Nincs következő program'}</span>
            </div>
            </div>
            <div className="text-right border-l border-white/20 dark:border-[#C5A059]/30 pl-4">
                <div className="text-[0.6rem] tracking-widest opacity-80">{ dayNumeric }</div>
                <div className="text-xl font-bold font-cinzel">{ dayName }</div>
            </div>
        </div>
)};