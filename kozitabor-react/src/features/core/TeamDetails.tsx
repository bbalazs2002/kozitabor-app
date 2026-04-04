import React, { useEffect, useState } from 'react';
import { useDb } from '../../context/core/DbContext';
import { type Team } from '../../types/database';
import { useParams } from 'react-router-dom';
import { ContentCard } from '../../components/core/ContentCard';
import { CardItem } from '../../components/core/CardItem';

export const TeamDetails: React.FC = () => {
    const { teamId } = useParams();

    // DB
    const context = useDb();
    const [team, setTeam] = useState<Team>();
    const [localLoading, setLocalLoading] = useState(true);
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const data = await context.getTeam(parseInt(String(teamId || "0"), 10));
                setTeam(data);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchLatest();
    }, [context]);
    if (localLoading || !team) return <div>Töltés...</div>;

    return (
        <ContentCard title={`${team.name} csapat`}>
            {/* LEADERS */}
            <h2>
                <span className="text-lg font-bold">Vezetők: </span>
            </h2>

            {
                team.leaders ? team.leaders.map(leader => (
                    <CardItem>
                        <span>{leader.contact.name}</span>
                    </CardItem>
                )) : ''
            }

            {/* MEMBERS */}
            <h2 className='mt-[2rem]'>
                <span className="text-lg font-bold">Csoporttagok: </span>
            </h2>

            <CardItem>
                <span>Nagy Árpi</span>
            </CardItem>
            <CardItem>
                <span>Nagy Árpi</span>
            </CardItem>
            <CardItem>
                <span>Nagy Árpi</span>
            </CardItem>
            <CardItem>
                <span>Nagy Árpi</span>
            </CardItem>
            <CardItem>
                <span>Nagy Árpi</span>
            </CardItem>
            <CardItem>
                <span>Nagy Árpi</span>
            </CardItem>
            <CardItem>
                <span>Nagy Árpi</span>
            </CardItem>

        </ContentCard>
    );
};