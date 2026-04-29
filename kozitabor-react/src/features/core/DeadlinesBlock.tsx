import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { InfoCard } from '../../components/core/InfoCard';
import { useDb } from '../../context/core/DbContext';
import { useTheme } from '../../context/core/ThemeContext';
import type { Deadline } from '../../types/database';
import { getDayDate } from '../../utils/dateHelpers';

const getDaysUntil = (date: string | Date): number => {
    const d = new Date(date);
    const todayUtc = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
    const deadlineUtc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return Math.round((deadlineUtc - todayUtc) / (1000 * 60 * 60 * 24));
};

interface DeadlinesBlockProps {
    limit?: number;
}

const DeadlinesBlock: React.FC<DeadlinesBlockProps> = ({ limit }) => {
    const { colors } = useTheme();
    const context = useDb();
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        context.getDeadlines()
            .then(all => {
                const sorted = [...all].sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setDeadlines(sorted);
            })
            .catch(err => console.error('Hiba a határidők lekérésekor:', err))
            .finally(() => setLocalLoading(false));
    }, [context]);

    const visible = limit ? deadlines.slice(0, limit) : deadlines;

    return (
        <InfoCard
            title="Fontos határidők"
            icon={Clock}
            loading={localLoading}
            buttonText={limit && deadlines.length > limit ? 'Összes határidő' : undefined}
            buttonTo="/deadlines"
        >
            {deadlines.length === 0 ? (
                <p className="text-sm py-2" style={{ color: colors.text2 }}>
                    Nincs megjeleníthető határidő.
                </p>
            ) : (
                visible.map(item => {
                    const days = getDaysUntil(item.date);
                    const isPast = days < 0;
                    const isToday = days === 0;

                    return (
                        <div
                            key={item.id}
                            className="flex items-center justify-between py-2 text-sm"
                            style={{
                                borderBottom: `1px solid ${colors.border}40`,
                                color: isPast ? `${colors.text2}60` : colors.text2,
                            }}
                        >
                            <span className={isPast ? 'line-through' : ''}>{item.label}</span>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                <span className="text-xs opacity-70">{getDayDate(item.date)}</span>
                                <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: isPast
                                            ? `${colors.border}40`
                                            : isToday
                                            ? '#ef444420'
                                            : `${colors.icon}20`,
                                        color: isPast
                                            ? colors.text2
                                            : isToday
                                            ? '#ef4444'
                                            : colors.icon,
                                    }}
                                >
                                    {isPast ? 'Lejárt' : isToday ? 'Ma!' : `${days} nap`}
                                </span>
                            </div>
                        </div>
                    );
                })
            )}
        </InfoCard>
    );
};

export default DeadlinesBlock;
