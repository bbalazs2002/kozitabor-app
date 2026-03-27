import { useEffect, useState } from 'react';
import { ContentCard } from '../../components/core/ContentCard';
import { useDb } from '../../context/core/DbContext';
import type { Team } from '../../types/database';
import { NavLink } from 'react-router-dom';

export const TeamsBlock: React.FC = () => {
    // DB
    const context = useDb();
    const [teams, setTeams] = useState<Team[]>([]);
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = await context.getTeams();
                setTeams(data);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
    }, [context]);
    if (localLoading || !teams) return <div>Betöltés...</div>;

    return (
        <ContentCard title="Csapatok">
            <div className="space-y-12">
                <div className="group">
                    {teams.map(team => (
                     <div key={team.id}>
                        {/* Csoportnév - Cinzel betűtípussal, nagy méretben */}
                        <h2
                            className="font-cinzel text-3xl md:text-4xl text-[#3e3028] mt-4
                                        dark:text-[#c5a059]">
                            {team.name}
                        </h2>
                        
                        {/* Vezetők listája - Behúzva (padding-left) */}
                        <ul
                            className="pl-8 space-y-2 border-l-2 border-[#c5a059] ml-1">
                            {team.leaders?.map(leader => (
                                <li 
                                    key={leader.contact.id}
                                    className="text-xl text-[#3e3028] dark:text-[#eaddca]/80 flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3e3028]/80 dark:bg-[#c5a059]" />
                                    <NavLink to="/contacts">{leader.contact.name}</NavLink>
                                </li>
                            ))}
                        </ul>
                     </div>   
                    ))}
                </div>
            </div>
        </ContentCard>
    );
};