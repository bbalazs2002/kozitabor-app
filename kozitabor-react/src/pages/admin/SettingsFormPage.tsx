import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminForm } from "../../components/admin/AdminForm";
import { AdminFormCard } from "../../components/admin/AdminFormCard";
import { Input } from "../../components/admin/FormInputs";
import { useDb } from "../../context/admin/DbContext";
import { useToast } from "../../context/admin/ToastContext";
import { adminApiRequest } from "../../utils/api";

const SettingsFormPage = () => {
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [strId, setStrId] = useState("");
  const [comment, setComment] = useState("");
  const [localLoading, setLocalLoading] = useState(true);

  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const context = useDb();

  useEffect(() => {
    if (id === undefined || id === "new") {
      navigate("/admin/settings", { replace: true });
      return;
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      navigate("/admin/settings", { replace: true });
      return;
    }

    context
      .getSetting(parsedId)
      .then((data) => {
        if (!data) {
          navigate("/admin/settings", { replace: true });
          return;
        }
        setLabel(data.label);
        setValue(data.value);
        setStrId(data.str_id);
        setComment(data.comment);
        setLocalLoading(false);
      })
      .catch(() => setLocalLoading(false));
  }, [id]);

  if (localLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Adatok betöltése...</p>
      </div>
    );

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async () => {
    try {
      const response = await adminApiRequest(`/setting/${id}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      });
      context.updateSettingInCache(response);
      navigate("/admin/settings");
    } catch {
      showToast("Hiba történt a mentés közben.", "error");
      throw new Error();
    }
  };

  return (
    <AdminForm title="Beállítás szerkesztése" onSubmit={handleSubmit}>
      <AdminFormCard>
        <div className="mb-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            Azonosító
          </p>
          <span className="inline-block bg-gray-100 text-gray-600 font-mono text-sm px-3 py-1 rounded-lg">
            {strId}
          </span>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            Beállítás neve
          </p>
          <p className="text-gray-700 font-medium">{label}</p>
        </div>
        <Input
          label="Érték"
          value={value}
          onChange={(e: any) => setValue(e.target.value)}
        />
        {comment && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Megjegyzés
            </p>
            <p className="text-sm text-gray-500 italic">{comment}</p>
          </div>
        )}
      </AdminFormCard>
    </AdminForm>
  );
};

export default SettingsFormPage;
