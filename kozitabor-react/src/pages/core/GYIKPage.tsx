import React, { useEffect, useState } from "react";
import { useDb } from "../../context/core/DbContext";
import { InfoDetails } from "../../features/core/InfoDetails";

const GYIKPage: React.FC = () => {
  const context = useDb();
  const [infoId, setInfoId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    context
      .getSettingByStrId("gyik_url")
      .then((s) => {
        if (s?.value) {
          const idStr = s.value.split("/").pop();
          const id = parseInt(idStr ?? "", 10);
          if (!isNaN(id)) setInfoId(id);
        }
      })
      .finally(() => setLoading(false));
  }, [context]);

  if (loading) return <div>Betöltés...</div>;
  if (!infoId) return <div>A GYIK oldal nem érhető el.</div>;

  return <InfoDetails infoId={infoId} />;
};

export default GYIKPage;
