import { useEffect, useState } from 'react';
import { Calendar, Users, Info, Clock, LayoutDashboard, Contact, ClipboardList } from 'lucide-react';
import { useDb } from '../../context/admin/DbContext';
import { useToast } from '../../context/admin/ToastContext';
import { adminApiRequest } from '../../utils/api';
import { formatOffsetToTime } from '../../utils/dateHelpers';
import { NavLink, useNavigate } from 'react-router-dom';
import ListCard from '../../components/admin/ListCard';
import AdminButton from '../../components/admin/AdminButton';
import type { Setting, Program, Deadline, Team, Contact as ContactType, Info as InfoType, OrganizerTask } from '../../types/database';

export default function DashboardPage() {
    const context = useDb();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<Team[]>([]);
    const [contacts, setContacts] = useState<ContactType[]>([]);
    const [infos, setInfos] = useState<InfoType[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [organizerTasks, setOrganizerTasks] = useState<OrganizerTask[]>([]);
    const [appStatusSetting, setAppStatusSetting] = useState<Setting | null>(null);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [t, c, i, p, d, s, ot] = await Promise.all([
                    context.getTeams(),
                    context.getContacts(),
                    context.getInfos(),
                    context.getPrograms(),
                    context.getDeadlines(),
                    context.getSettings(),
                    context.getOrganizerTasks(),
                ]);
                setTeams(t);
                setContacts(c);
                setInfos(i);
                setPrograms(p);
                setDeadlines(d);
                setOrganizerTasks(ot);
                setAppStatusSetting(s.find(x => x.str_id === 'app_status') ?? null);
            } catch (err) {
                console.error('Dashboard betöltési hiba:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleToggle = async () => {
        if (!appStatusSetting || toggling) return;
        const newValue = appStatusSetting.value === 'active' ? 'inactive' : 'active';
        setToggling(true);
        try {
            const updated: Setting = await adminApiRequest(`/setting/${appStatusSetting.id}`, {
                method: 'PUT',
                body: JSON.stringify({ label: appStatusSetting.label, value: newValue }),
            });
            context.updateSettingInCache(updated);
            setAppStatusSetting(updated);
            showToast(`Tábor alatti mód ${newValue === 'active' ? 'bekapcsolva' : 'kikapcsolva'}.`);
        } catch {
            showToast('Hiba a beállítás mentésekor.', 'error');
        } finally {
            setToggling(false);
        }
    };

    if (loading) return <div className="py-20 text-center text-gray-400 animate-pulse">Betöltés...</div>;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingPrograms = programs.filter(p => new Date(p.startDay) >= today).slice(0, 5);
    const upcomingDeadlines = deadlines.filter(d => new Date(d.date) >= today).slice(0, 5);
    const upcomingOrganizerTasks = organizerTasks.filter(t => new Date(t.day) >= today).slice(0, 5);
    const isActive = appStatusSetting?.value === 'active';

    const stats = [
        { title: 'Csapatok',  value: teams.length,    icon: <Users size={20} />,          color: 'bg-blue-50 text-blue-600',    to: '/admin/teams' },
        { title: 'Kontaktok', value: contacts.length,  icon: <Contact size={20} />,        color: 'bg-amber-50 text-amber-600',  to: '/admin/contacts' },
        { title: 'Programok', value: programs.length,  icon: <Calendar size={20} />,       color: 'bg-emerald-50 text-emerald-600', to: '/admin/programs' },
        { title: 'Infókártyák', value: infos.length,  icon: <Info size={20} />,            color: 'bg-purple-50 text-purple-600', to: '/admin/infos' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <LayoutDashboard size={28} className="text-indigo-500" />
                    Vezérlőpult
                </h1>
                <p className="text-gray-500 mt-1">Üdvözlünk az admin felületen!</p>
            </div>

            {/* App status toggle */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-6">
                <div>
                    <p className="font-semibold text-gray-900 text-base">Tábor alatti mód</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {isActive
                            ? 'Az alkalmazás aktív — a résztvevők a tábor alatti felületet látják.'
                            : 'Az alkalmazás inaktív — a résztvevők a tábor előtti felületet látják.'}
                    </p>
                </div>
                <button
                    onClick={handleToggle}
                    disabled={toggling || !appStatusSetting}
                    aria-pressed={isActive}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${isActive ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <NavLink
                        key={i}
                        to={stat.to}
                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
                    >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </NavLink>
                ))}
            </div>

            {/* Szekciók egymás alatt */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList size={16} className="text-indigo-500" /> Közelgő szervezői feladatok
                        </h2>
                        <AdminButton to="/admin/organizer-tasks" className="text-xs px-3 py-1.5">Összes</AdminButton>
                    </div>
                    <div className="grid gap-3">
                        {upcomingOrganizerTasks.length === 0 ? (
                            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-sm text-gray-400">
                                Nincs közelgő szervezői feladat.
                            </div>
                        ) : upcomingOrganizerTasks.map(t => (
                            <ListCard
                                key={t.id}
                                id={t.id.toString()}
                                title={t.organizerActivity.title}
                                icon={<ClipboardList size={20} />}
                                info={
                                    <span className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                                            {new Date(t.day).toLocaleDateString('hu-HU')} {formatOffsetToTime(t.timeOffset)}
                                        </span>
                                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                            {t.contact.name}
                                        </span>
                                    </span>
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Calendar size={16} className="text-emerald-500" /> Közelgő programok
                        </h2>
                        <AdminButton to="/admin/programs" className="text-xs px-3 py-1.5">Összes</AdminButton>
                    </div>
                    <div className="grid gap-3">
                        {upcomingPrograms.length === 0 ? (
                            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-sm text-gray-400">
                                Nincs közelgő program.
                            </div>
                        ) : upcomingPrograms.map(p => (
                            <ListCard
                                key={p.id}
                                id={p.id.toString()}
                                title={`${p.title} — ${formatOffsetToTime(p.startTimeOffset)}`}
                                icon={<Calendar size={20} />}
                                info={
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                                        {new Date(p.startDay).toLocaleDateString('hu-HU')}
                                    </span>
                                }
                                editAction={() => navigate(`/admin/program/${p.id}`)}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Clock size={16} className="text-rose-500" /> Közelgő határidők
                        </h2>
                        <AdminButton to="/admin/deadlines" className="text-xs px-3 py-1.5">Összes</AdminButton>
                    </div>
                    <div className="grid gap-3">
                        {upcomingDeadlines.length === 0 ? (
                            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-sm text-gray-400">
                                Nincs közelgő határidő.
                            </div>
                        ) : upcomingDeadlines.map(d => (
                            <ListCard
                                key={d.id}
                                id={d.id.toString()}
                                title={d.label}
                                icon={<Clock size={20} />}
                                info={
                                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full uppercase">
                                        {new Date(d.date).toLocaleDateString('hu-HU')}
                                    </span>
                                }
                                editAction={() => navigate(`/admin/deadline/${d.id}`)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
