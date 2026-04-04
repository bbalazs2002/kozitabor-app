import React from 'react';
import { useLivePrograms } from '../../hooks/useLiveProgram';
import { formatOffsetToTime } from '../../utils/dateHelpers';
import { useTheme } from '../../context/core/ThemeContext';

export const StatusHeader: React.FC = () => {
    const { colors } = useTheme();
    
    const now = new Date();
    const dayName = new Intl.DateTimeFormat('hu-HU', { weekday: 'long' })
        .format(now)
        .toUpperCase();
    const dayNumeric = new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric' })
        .format(now)
        .toUpperCase();

    const { data } = useLivePrograms(30000);

    return (
        <div 
            className="relative z-10 w-full max-w-[25rem] flex justify-between items-center 
                       rounded-[1.5rem] border-2 p-4 mb-5 shadow-xl"
            style={{ 
                // A paletta headerBgGradient objektumát használjuk
                backgroundImage: `linear-gradient(to bottom, ${colors.headerBgGradient.from}, ${colors.headerBgGradient.to})`,
                borderColor: colors.border,
                color: colors.text1 // Világosban krémszín (#f4e4bc), sötétben arany (#c5a059)
            }}
        >
            <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-[0.7rem] opacity-70 font-bold uppercase tracking-wider">Éppen most:</span>
                    <span className="text-xl font-cinzel leading-none">{data?.current?.title || 'Betöltés...'}</span>
                </div>
                
                <div className="flex items-baseline gap-2 opacity-90">
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider opacity-60">Ezután:</span>
                    <span className="text-sm font-cinzel opacity-80">
                        {data?.next 
                            ? `${data.next.title} - ${formatOffsetToTime(data.next.startTimeOffset)}` 
                            : 'Nincs következő program'}
                    </span>
                </div>
            </div>

            <div 
                className="text-right pl-4 border-l"
                style={{ borderColor: `${colors.border}4d` }}
            >
                <div className="text-[0.6rem] tracking-widest opacity-70 mb-1">{ dayNumeric }</div>
                <div className="text-xl font-bold font-cinzel leading-tight">{ dayName }</div>
            </div>
        </div>
    );
};