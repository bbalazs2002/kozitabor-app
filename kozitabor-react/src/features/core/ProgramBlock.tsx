import { InfoCard } from "../../components/core/InfoCard"
import { Calendar } from 'lucide-react';
import { InfoCardItemTime } from "../../components/core/InfoCardItemTime";
import { useLocation } from "react-router-dom";
import { useDb } from "../../context/core/DbContext";
import { useEffect, useState } from "react";
import type { Program } from "../../types/database";
import { formatOffsetToTime, getDayDate } from "../../utils/dateHelpers";

const ProgramBlock: React.FC = () => {

    const location = useLocation();
    const isHomePage = location.pathname === "/";

    // DB
    const context = useDb();
    const [programs, setPrograms] = useState<any[]>([]);
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = isHomePage ? await context.getUpcomingPrograms(3) : await context.getPrograms();

                // Csoportosítás napok szerint
                const groupedData = data.reduce((acc: any, d) => {
                    const dayLabel = getDayDate(d.startDay);
                    if (!acc[dayLabel]) acc[dayLabel] = [];
                    acc[dayLabel].push(d);
                    return acc;
                }, {});

                setPrograms(groupedData);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
    }, [context]);
    if (localLoading) return <div>Betöltés...</div>;

    return (
    <InfoCard title='Program' icon={Calendar} buttonText={isHomePage ? 'Programterv' : undefined} buttonColor='#8B2622' buttonTo="/program">
        {
            Object.entries(programs).map(([day, progs]) => (
                <div key={day}>
                    <h2
                        className="
                            text-lg font-semibold text-blue-800 border-b-2
                            border-[#5d40371a]/10 dark:border-[#c5a059]
                            text-[#203a6f] dark:text-[#c5a059]
                            pb-1 pt-5 capitalize"
                    >
                        {day}
                    </h2>
                    {
                    progs.map((prog: Program) => (
                        <InfoCardItemTime
                            to={prog.desc ? `/program/${prog.id}` : undefined}
                            key={prog.id}
                            time={formatOffsetToTime(prog.startTimeOffset)}
                        >
                            {prog.title}
                        </InfoCardItemTime>
                    ))
                    }
                </div>
            ))
        }
    </InfoCard>
)};

export default ProgramBlock;