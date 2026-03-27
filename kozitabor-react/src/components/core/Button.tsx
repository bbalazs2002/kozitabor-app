import React from 'react';
import { NavLink } from 'react-router-dom';

interface ButtonProps {
  color: string;
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({color, to, children, onClick}) => {
    return (
        <NavLink
        onClick={onClick}
        to={to ?? ""}
        style={{ backgroundColor: color }}
        className={`inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[#C5A059] 
                          font-cinzel font-bold text-[0.7rem] uppercase tracking-wider transition-all
                          text-[#f4e4bc] dark:!bg-transparent dark:!text-[#C5A059]`}>
          {children}
        </NavLink>
)};