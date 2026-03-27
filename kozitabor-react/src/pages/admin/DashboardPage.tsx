import { useEffect, useState } from 'react';
import { Grid, Card, Title, DonutChart, BarChart } from "@tremor/react";
import { Calendar, Users, Layers, Info, User } from 'lucide-react';
import ListCard from '../../components/admin/ListCard';
import { type DashboardSummary } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import { NavLink, useNavigate } from 'react-router-dom';
import AdminButton from '../../components/admin/AdminButton';
import { CustomTooltip } from '../../components/admin/DashboardCharts';
import { formatOffsetToTime } from '../../utils/dateHelpers';

export default function DashboardPage() {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const context = useDb();

    useEffect(() => {
        // 3. Adatlekérés
        const fetchLatest = async () => {
            try {
                setLoading(true);
                const newData = await context.getDashboardData();
                if (!newData) {
                    return;
                }
                setData(newData);
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLatest();
    }, []);

    if (loading || !data) return <div className="p-10 text-center">Betöltés...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-8">
            {/* 1. Header szekció */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vezérlőpult</h1>
                <p className="text-gray-500 mt-1">Üdvözlünk az admin felületen! Így állunk ma.</p>
            </div>

            {/* 2. Gyors statisztikák - Tremor kártyákkal, de a te stílusodhoz igazítva */}
            <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
                {[
                    { title: "Csapatok", value: data.stats.totalTeams, page: "/admin/teams", icon: <Users size={20}/>, color: "bg-blue-50 text-blue-600" },
                    { title: "Feladatok", value: data.stats.totalTasks, page: "/admin/tasks", icon: <Layers size={20}/>, color: "bg-emerald-50 text-emerald-600" },
                    { title: "Vezetők", value: data.stats.totalLeaders, page: "/admin/contacts", icon: <User size={20}/>, color: "bg-amber-50 text-amber-600" },
                    { title: "Infók", value: data.stats.activeInfoCards, page: "/admin/infos", icon: <Info size={20}/>, color: "bg-purple-50 text-purple-600" },
                ].map((stat, i) => (
                    <NavLink
                        key={i}
                        to={stat.page}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </NavLink>
                ))}
            </Grid>

            {/* 3. Grafikonok */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="!rounded-2xl border-none shadow-sm">
                    <Title>Tevékenységek eloszlása</Title>
                    <DonutChart
                        className="h-64 mt-4"
                        data={data.activityDistribution}
                        category="count"
                        index="name"
                        customTooltip={CustomTooltip}
                        colors={["indigo", "violet", "fuchsia", "rose", "cyan", "amber"]}
                    />
                </Card>
                <Card className="!rounded-2xl border-none shadow-sm">
                    <Title>Csapatok terheltsége</Title>
                    <BarChart
                        className="h-64 mt-4"
                        data={data.teamWorkload}
                        index="teamName"
                        categories={["taskCount"]}
                        colors={["indigo"]}
                        customTooltip={CustomTooltip}
                    />
                </Card>
            </div>

            {/* 4. Közelgő programok - Itt használjuk a te ListCard-odat! */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Közelgő programok</h2>
                    <AdminButton
                        to='/admin/programs'
                        variant='primary'
                    >
                        Összes program
                    </AdminButton>
                </div>
                
                <div className="grid gap-3">
                    {data.upcomingPrograms.map((program) => (
                        <ListCard 
                            key={program.id.toString()}
                            id={program.id.toString()}
                            title={`${program.title} - ${formatOffsetToTime(program.startTimeOffset)}`}
                            icon={<Calendar size={24} />}
                            info={
                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    {new Date(program.startDay).toLocaleDateString('hu-HU')}
                                </span>
                            }
                            editAction={() => navigate(`/admin/program/${program.id}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}