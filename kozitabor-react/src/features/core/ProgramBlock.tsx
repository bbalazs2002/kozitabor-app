import { Calendar, ChevronRight } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AccordionItem } from "../../components/core/AccordionItem";
import { InfoCard } from "../../components/core/InfoCard";
import { useDb } from "../../context/core/DbContext";
import { useTheme } from "../../context/core/ThemeContext";
import type { Program } from "../../types/database";
import {
  dayOffsetToUtcTs,
  formatUtcOffsetToLocalTime,
  getDayDate,
} from "../../utils/dateHelpers";

const HOME_DAY_LIMIT = 3;

const ProgramBlock: FC = () => {
  const { colors } = useTheme();

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const context = useDb();
  const [grouped, setGrouped] = useState<Record<string, Program[]>>({});
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await context.getPrograms();

        let items = data;
        if (isHomePage) {
          const nowTs = Date.now();
          items = data.filter((p) => dayOffsetToUtcTs(p.endDay, p.endTimeOffset) > nowTs);
        }

        const allGrouped = items.reduce((acc: Record<string, Program[]>, d) => {
          const dayLabel = getDayDate(d.startDay);
          if (!acc[dayLabel]) acc[dayLabel] = [];
          acc[dayLabel].push(d);
          return acc;
        }, {});

        if (isHomePage) {
          const dayKeys = Object.keys(allGrouped).slice(0, HOME_DAY_LIMIT);
          setGrouped(Object.fromEntries(dayKeys.map((k) => [k, allGrouped[k]])));
        } else {
          setGrouped(allGrouped);
        }
      } catch (err) {
        console.error("Hiba az adatok lekérésekor:", err);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchLatest();
  }, [context]);

  return (
    <InfoCard
      title="Programok"
      icon={Calendar}
      loading={localLoading}
      buttonText={isHomePage ? "Programterv" : undefined}
      buttonColor={colors.button2}
      buttonTo="/program"
    >
      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm py-2" style={{ color: colors.text2 }}>
          Nincs megjeleníthető program.
        </p>
      ) : (
        Object.entries(grouped).map(([day, progs]) => (
          <AccordionItem key={day} label={day}>
            <div>
              {progs.map((prog: Program) => (
                <div
                  key={prog.id}
                  className="flex items-center gap-3 py-2 text-sm"
                  style={{
                    borderBottom: `1px solid ${colors.border}40`,
                    color: colors.text2,
                  }}
                >
                  <span className="shrink-0 text-xs" style={{ opacity: 0.55 }}>
                    {formatUtcOffsetToLocalTime(prog.startDay, prog.startTimeOffset)}
                    {" – "}
                    {formatUtcOffsetToLocalTime(prog.endDay, prog.endTimeOffset)}
                  </span>
                  {prog.desc ? (
                    <NavLink
                      to={`/program/${prog.id}`}
                      className="flex-1 flex items-center gap-1 hover:underline"
                    >
                      {prog.title}
                      <ChevronRight size={12} style={{ color: colors.icon }} />
                    </NavLink>
                  ) : (
                    <span className="flex-1">{prog.title}</span>
                  )}
                </div>
              ))}
            </div>
          </AccordionItem>
        ))
      )}
    </InfoCard>
  );
};

export default ProgramBlock;
