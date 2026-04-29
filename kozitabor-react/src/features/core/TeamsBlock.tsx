import { useEffect, useState } from 'react';
import { ContentCard } from '../../components/core/ContentCard';
import { AccordionItem } from '../../components/core/AccordionItem';
import { useDb } from '../../context/core/DbContext';
import { useTheme } from '../../context/core/ThemeContext';
import type { Team } from '../../types/database';
import { ExternalLink, Phone } from 'lucide-react';

export const TeamsBlock: React.FC = () => {
    const context = useDb();
    const { colors } = useTheme();
    const [teams, setTeams] = useState<Team[]>([]);
    const [groupSheetUrl, setGroupSheetUrl] = useState<string>('');
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            context.getTeams(),
            context.getSettingByStrId('group_sheet_url'),
        ]).then(([teamsData, setting]) => {
            setTeams(teamsData);
            setGroupSheetUrl(setting?.value ?? '');
        }).catch(err => {
            console.error('Hiba az adatok lekérésekor:', err);
        }).finally(() => setLocalLoading(false));
    }, [context]);

    if (localLoading) return <div>Betöltés...</div>;

    const leaders = teams.flatMap(team =>
        (team.leaders ?? []).map(l => ({ ...l.contact, teamName: team.name }))
    );

    return (
        <ContentCard title="Csoportok">
            <div className="space-y-6">

                {/* Csoportbeosztás link */}
                {groupSheetUrl ? (
                    <a
                        href={groupSheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
                        style={{
                            background: `linear-gradient(to right, ${colors.cardBgGradient.to}, ${colors.cardBgGradient.from})`,
                            border: `1px solid ${colors.border}`,
                            color: colors.text2,
                        }}
                    >
                        <ExternalLink size={16} style={{ color: colors.icon }} className="shrink-0" />
                        Csoportbeosztás megtekintése
                    </a>
                ) : (
                    <p className="text-sm italic px-1" style={{ color: `${colors.text2}80` }}>
                        A csoportbeosztás hamarosan elérhető lesz.
                    </p>
                )}

                {/* Csapatvezetők */}
                {leaders.length > 0 && (
                    <div>
                        <p
                            className="text-xs uppercase tracking-widest px-1 mb-1"
                            style={{ color: `${colors.text2}80` }}
                        >
                            Csoportvezetők
                        </p>
                        <div>
                            {leaders.map(leader => (
                                <AccordionItem key={leader.id} label={leader.name}>
                                    {leader.tel ? (
                                        <div className="flex items-center gap-2 py-1">
                                            <Phone size={14} style={{ color: colors.icon }} className="shrink-0" />
                                            <span
                                                className="text-sm flex-1"
                                                style={{ color: colors.text2 }}
                                            >
                                                {leader.tel}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm italic" style={{ color: `${colors.text2}60` }}>
                                            Nincs telefonszám megadva.
                                        </span>
                                    )}
                                </AccordionItem>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ContentCard>
    );
};
