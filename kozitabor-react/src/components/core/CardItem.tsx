import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/core/ThemeContext';

interface CardItemProps {
  icon?: React.ReactNode;
  to?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const CardItem: React.FC<CardItemProps> = ({
  icon,
  to,
  onClick,
  children,
  className = '',
}) => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const clickable = !!to || !!onClick;

  // Ref-ek az egér pozíció tárolásához
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Csak bal egérgomb esetén jegyezzük meg a pozíciót
    if (e.button !== 0) return;
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!clickable) return;
    // Csak bal egérgomb esetén dolgozzuk fel
    if (e.button !== 0) return;

    if (mouseDownPos.current) {
      const dx = Math.abs(e.clientX - mouseDownPos.current.x);
      const dy = Math.abs(e.clientY - mouseDownPos.current.y);
      const moveThreshold = 5; // pixelben, ennél nagyobb mozgás esetén nem kattintás

      if (dx <= moveThreshold && dy <= moveThreshold) {
        // Kattintásnak tekintjük
        if (onClick) onClick();
        if (to) navigate(to);
      }
    }
    mouseDownPos.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (onClick) onClick();
      if (to) navigate(to);
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={`
        flex items-center gap-3 py-3 px-1
        ${clickable ? 'cursor-pointer select-text' : ''}
        ${className}
      `}
      style={{
        border: `none`,
        borderBottom: `1px solid ${colors.border}`,
        color: colors.text2,
        userSelect: 'text',
      }}
    >
      {/* ICON */}
      {icon ?? ''}

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-between gap-4">

        {/* RIGHT SIDE (CUSTOM CHILDREN + CHEVRON) */}
        <div className="flex items-center gap-3">
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className="text-sm"
              style={{ color: colors.text2 }}
            >
              {child}
            </div>
          ))}

          {to && (
            <ChevronRight
              size={16}
              style={{ color: colors.icon }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
