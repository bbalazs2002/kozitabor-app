import { ClipboardList } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDb } from '../../context/core/DbContext';
import { useEffect, useState } from 'react';
import type { CamperTask } from '../../types/database';
import { formatOffsetToTime, getDayDate } from '../../utils/dateHelpers';
import { InfoCard } from '../../components/core/InfoCard';
import { AccordionItem } from '../../components/core/AccordionItem';
import { useTheme } from '../../context/core/ThemeContext';

const HOME_DAY_LIMIT = 3;

const CamperTaskBlock: React.FC = () => {
    const { colors } = useTheme();

    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const context = useDb();
    const [grouped, setGrouped] = useState<Record<string, CamperTask[]>>({});
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await context.getCamperTasks();

                let items = data;
                if (isHomePage) {
                    const todayUTC = new Date().toISOString().split('T')[0];
                    items = data.filter(task =>
                        new Date(task.day).toISOString().split('T')[0] >= todayUTC
                    );
                }

                const allGrouped = items.reduce((acc: Record<string, CamperTask[]>, task) => {
                    const dayLabel = getDayDate(task.day);
                    if (!acc[dayLabel]) acc[dayLabel] = [];
                    acc[dayLabel].push(task);
                    return acc;
                }, {});

                if (isHomePage) {
                    const dayKeys = Object.keys(allGrouped).slice(0, HOME_DAY_LIMIT);
                    setGrouped(Object.fromEntries(dayKeys.map(k => [k, allGrouped[k]])));
                } else {
                    setGrouped(allGrouped);
                }
            } catch (err) {
                console.error('Hiba az adatok lekérésekor:', err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchTasks();
    }, [context]);

    return (
        <InfoCard
            title="Tábori beosztás"
            icon={ClipboardList}
            loading={localLoading}
            buttonText={isHomePage ? 'Teljes beosztás' : undefined}
            buttonColor={colors.button2}
            buttonTo="/tasks"
        >
            {Object.keys(grouped).length === 0 ? (
                <p className="text-sm py-2" style={{ color: colors.text2 }}>
                    {isHomePage ? 'Nincs közelgő feladat.' : 'Nincs megjeleníthető feladat.'}
                </p>
            ) : (
                Object.entries(grouped).map(([day, tasks]) => (
                    <AccordionItem key={day} label={day}>
                        <div>
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 py-2 text-sm"
                                    style={{ borderBottom: `1px solid ${colors.border}40`, color: colors.text2 }}
                                >
                                    <span className="shrink-0" style={{ opacity: 0.55 }}>
                                        {formatOffsetToTime(task.timeOffset)}
                                    </span>
                                    <span className="flex-1">{task.camperActivity.title}</span>
                                    <span className="text-xs shrink-0" style={{ opacity: 0.6 }}>
                                        {task.team.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </AccordionItem>
                ))
            )}
        </InfoCard>
    );
};

export default CamperTaskBlock;
