import { Check, CheckCheckIcon, CheckSquare, Square } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CardItem } from "../../components/core/CardItem";
import { InfoCard } from "../../components/core/InfoCard";
import { useDb } from "../../context/core/DbContext";
import { useTheme } from "../../context/core/ThemeContext";
import type { Bring } from "../../types/database";

const STORAGE_KEY = "kozitabor_bring_checked";

const WhatToBringBlock: FC = () => {
  const { colors } = useTheme();

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const context = useDb();
  const [items, setItems] = useState<Bring[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  const [checked, setChecked] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set<number>(JSON.parse(stored)) : new Set<number>();
    } catch {
      return new Set<number>();
    }
  });

  const toggleItem = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = isHomePage ? await context.getNBring(3) : await context.getBring();
        setItems(data);
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
      title="Mit hozz?"
      icon={CheckCheckIcon}
      loading={localLoading}
      buttonText={isHomePage ? "Teljes lista" : undefined}
      buttonTo="/whatToBring"
    >
      <div className="flex flex-col divide-y divide-gray-300 dark:divide-gray-700">
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <CardItem
              key={item.id}
              icon={<Check color={colors.icon} />}
              onClick={() => toggleItem(item.id)}
              rightSlot={
                isChecked ? (
                  <CheckSquare size={18} color={colors.icon} />
                ) : (
                  <Square size={18} color={colors.text2} style={{ opacity: 0.35 }} />
                )
              }
              className="px-2"
            >
              <span
                style={isChecked ? { textDecoration: "line-through", opacity: 0.45 } : {}}
              >
                {item.title}
              </span>
            </CardItem>
          );
        })}
      </div>
    </InfoCard>
  );
};

export default WhatToBringBlock;
