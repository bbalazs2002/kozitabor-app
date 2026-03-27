import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoonDatePicker, TimeOffsetPicker } from '../../components/admin/FormInputs';
import { useDb } from '../../context/admin/DbContext';
import type { TaskData } from '../../types/forms';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';
import { AdminForm } from '../../components/admin/AdminForm';
import { AdminFormCard } from '../../components/admin/AdminFormCard';
import { getTodayNoon } from '../../utils/dateHelpers';
import type { Activity, Team } from '../../types/database';
import { MultiSelect } from '../../components/admin/MultiSelect';

const TaskFormPage = () => {
    // Default content
    const emptyForm: TaskData = {
        day: getTodayNoon(),
        timeOffset: 43200, // midday
        activityIds: [],
        teamIds: []
    };

    // States
    const [formData, setFormData] = useState<TaskData>(emptyForm);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    // Toast message
    const { showToast } = useToast();

    // Other variables
    const navigate = useNavigate();
    const context = useDb();

     useEffect(() => {
    
        // Adatlekérés
        const fetchLatest = async () => {

            // Activities
            try {
                const data = await context.getActivities();
                if (!data) {
                    setActivities([]);
                    return;
                }
                setActivities(data);
            } catch (err) {
                setActivities([]);
                console.error("Hiba az adatok lekérésekor:", err);
            }

            // Teams
            try {
                const data = await context.getTeams();
                if (!data) {
                    setTeams([]);
                    return;
                }
                setTeams(data);
            } catch (err) {
                setTeams([]);
                console.error("Hiba az adatok lekérésekor:", err);
            }

        };

        fetchLatest();
    }, [navigate]);

    // Form submit handler
    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async () => {
        const method = 'POST';
        const url = '/task';

        try {
            const response = await adminApiRequest(url, {
                method,
                body: JSON.stringify({
                    ...formData
                })
            });

            // success
            context.addTasksToCache(response);
            navigate('/admin/tasks'); 
            
        } catch (error) {
            console.error("Mentési hiba:", error);
            showToast("Hiba történt a mentés közben.", "error");
            throw(error);
        }
    };

    // Main component
    return (
        <AdminForm
            title='Új feladatok létrehozása'
            onSubmit={handleSubmit}
        >
            <AdminFormCard>
                <NoonDatePicker
                    label='Nap'
                    value={formData.day}
                    onChange={date => setFormData({...formData, day: date})}
                /> 
                <TimeOffsetPicker
                    label='Időpont'
                    offset={formData.timeOffset}
                    onChange={time => setFormData({...formData, timeOffset: time})}
                />
                <MultiSelect 
                    label='Feladatok'
                    icon='Menu'
                    selectedIds={formData.activityIds}
                    options={activities}
                    onChange={ids => setFormData({...formData, activityIds: ids})}
                />
                <MultiSelect 
                    label='Csapatok'
                    icon='Users'
                    selectedIds={formData.teamIds}
                    options={teams}
                    onChange={ids => setFormData({...formData, teamIds: ids})}
                />
            </AdminFormCard>
        </AdminForm>
    );
};

export default TaskFormPage;