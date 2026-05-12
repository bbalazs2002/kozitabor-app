import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminForm } from "../../components/admin/AdminForm";
import { AdminFormCard } from "../../components/admin/AdminFormCard";
import { NoonDatePicker, TimeOffsetPicker } from "../../components/admin/FormInputs";
import { MultiSelect } from "../../components/admin/MultiSelect";
import { useDb } from "../../context/admin/DbContext";
import { useToast } from "../../context/admin/ToastContext";
import type { Contact, OrganizerActivity } from "../../types/database";
import type { OrganizerTaskData } from "../../types/forms";
import { adminApiRequest } from "../../utils/api";
import { getTodayNoon } from "../../utils/dateHelpers";

const OrganizerTaskFormPage = () => {
  const emptyForm: OrganizerTaskData = {
    day: getTodayNoon(),
    timeOffset: 43200,
    contactIds: [],
    activityIds: [],
  };

  const [formData, setFormData] = useState<OrganizerTaskData>(emptyForm);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<OrganizerActivity[]>([]);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const context = useDb();

  useEffect(() => {
    Promise.all([context.getContacts(), context.getOrganizerActivities()])
      .then(([c, a]) => {
        setContacts(c);
        setActivities(a);
      })
      .catch((err) => console.error("Hiba az adatok lekérésekor:", err));
  }, []);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async () => {
    try {
      const response = await adminApiRequest("/organizer-task", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      context.addOrganizerTasksToCache(Array.isArray(response) ? response : [response]);
      navigate("/admin/organizer-tasks");
    } catch {
      showToast("Hiba történt a mentés közben.", "error");
      throw new Error();
    }
  };

  return (
    <AdminForm title="Új szervezői feladatok létrehozása" onSubmit={handleSubmit}>
      <AdminFormCard>
        <NoonDatePicker
          label="Nap"
          value={formData.day}
          onChange={(date) => setFormData({ ...formData, day: date })}
        />
        <TimeOffsetPicker
          label="Időpont"
          offset={formData.timeOffset}
          onChange={(time) => setFormData({ ...formData, timeOffset: time })}
        />
        <MultiSelect
          label="Szervezők"
          icon="User"
          selectedIds={formData.contactIds}
          options={contacts}
          onChange={(ids) => setFormData({ ...formData, contactIds: ids })}
        />
        <MultiSelect
          label="Tevékenységek"
          icon="List"
          selectedIds={formData.activityIds}
          options={activities}
          onChange={(ids) => setFormData({ ...formData, activityIds: ids })}
        />
      </AdminFormCard>
    </AdminForm>
  );
};

export default OrganizerTaskFormPage;
