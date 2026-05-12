import { Info } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CardItem } from "../../components/core/CardItem";
import DynamicIcon from "../../components/core/DynamicIcon";
import { InfoCard } from "../../components/core/InfoCard";
import { useDb } from "../../context/core/DbContext";
import { useTheme } from "../../context/core/ThemeContext";
import { type Info as InfoType } from "../../types/database";

const InfoBlock: FC = () => {
  // style
  const { colors } = useTheme();

  // Router path
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // DB
  const context = useDb();
  const [latestInfos, setLatestInfos] = useState<InfoType[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = isHomePage ? await context.getNInfos(3) : await context.getInfos();
        setLatestInfos(data);
      } catch (err) {
        console.error("Hiba az adatok lekérésekor:", err);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchLatest();
  }, [context]);
  // Component
  return (
    <InfoCard
      title="Fontos Infók"
      icon={Info}
      loading={localLoading}
      buttonText={isHomePage ? "További infók" : undefined}
      buttonTo="/info"
    >
      <div className="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
        {latestInfos.map((info) => (
          <CardItem
            key={info.id}
            to={`/info/${info.id}`}
            icon={
              <DynamicIcon
                name={info.icon}
                size={22}
                color={colors.icon}
                className="mr-3"
              />
            }
            className="px-2"
          >
            <span>{info.title}</span>
          </CardItem>
        ))}
      </div>
    </InfoCard>
  );
};

export default InfoBlock;
