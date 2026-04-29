import React, { useEffect, useRef, useState } from 'react';
import { useLivePrograms } from '../../hooks/useLiveProgram';
import { formatUtcOffsetToLocalTime } from '../../utils/dateHelpers';
import { useTheme } from '../../context/core/ThemeContext';
import { useDb } from '../../context/core/DbContext';

export const StatusHeader: React.FC = () => {
    const { colors } = useTheme();
    const { getSettingByStrId } = useDb();

    const now = new Date();
    const dayName = new Intl.DateTimeFormat('hu-HU', { weekday: 'long' }).format(now).toUpperCase();
    const dayNumeric = new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric' }).format(now).toUpperCase();

    const { data, loading } = useLivePrograms(30000);

    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;
        const update = () =>
            document.documentElement.style.setProperty('--status-header-height', `${el.offsetHeight}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const [appStatus, setAppStatus] = useState<string | null>(null);
    const [campStartDate, setCampStartDate] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [registrantCount, setRegistrantCount] = useState('');

    useEffect(() => {
        Promise.all([
            getSettingByStrId('app_status'),
            getSettingByStrId('camp_start_date'),
            getSettingByStrId('facebook_event_url'),
            getSettingByStrId('registrant_count'),
        ]).then(([status, campStart, fbUrl, regCount]) => {
            setAppStatus(status?.value ?? 'active');
            setCampStartDate(campStart?.value ?? '');
            setFacebookUrl(fbUrl?.value ?? '');
            setRegistrantCount(regCount?.value ?? '');
        });
    }, []);

    const isActive = appStatus === null || appStatus === 'active';

    const daysUntilCamp = campStartDate
        ? Math.ceil((new Date(campStartDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div
            ref={headerRef}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[25rem] flex justify-between items-center
                       rounded-[1.5rem] border-2 p-4 shadow-xl"
            style={{
                backgroundImage: `linear-gradient(to bottom, ${colors.headerBgGradient.from}, ${colors.headerBgGradient.to})`,
                borderColor: colors.border,
                color: colors.text1,
            }}
        >
            {isActive ? (
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-[0.7rem] opacity-70 font-bold uppercase tracking-wider">Éppen most:</span>
                        <span className="text-xl font-cinzel leading-none">
                            {loading ? 'Betöltés...' : (data?.current?.title || 'Nincs aktív program')}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2 opacity-90">
                        <span className="text-[0.6rem] font-bold uppercase tracking-wider opacity-60">Ezután:</span>
                        <span className="text-sm font-cinzel opacity-80">
                            {loading ? '...' : data?.next
                                ? `${data.next.title} - ${formatUtcOffsetToLocalTime(data.next.startDay, data.next.startTimeOffset)}`
                                : 'Nincs következő program'}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                        {facebookUrl ? (
                            <a
                                href={facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xl font-cinzel leading-none hover:underline"
                            >
                                Facebook esemény
                            </a>
                        ) : (
                            <span className="text-xl font-cinzel leading-none">Facebook esemény</span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2 opacity-90">
                        <span className="text-[0.6rem] font-bold uppercase tracking-wider opacity-60">Jelentkezők:</span>
                        <span className="text-sm font-cinzel opacity-80">{registrantCount || '–'} fő</span>
                    </div>
                </div>
            )}

            <div
                className="text-right pl-4 border-l shrink-0"
                style={{ borderColor: `${colors.border}4d` }}
            >
                {isActive ? (
                    <>
                        <div className="text-[0.6rem] tracking-widest opacity-70 mb-1">{dayNumeric}</div>
                        <div className="text-xl font-bold font-cinzel leading-tight">{dayName}</div>
                    </>
                ) : (
                    <>
                        <div className="text-[0.6rem] tracking-widest opacity-70 mb-1 uppercase">Még</div>
                        <div className="text-xl font-bold font-cinzel leading-tight">
                            {daysUntilCamp !== null ? `${daysUntilCamp} nap` : '...'}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
