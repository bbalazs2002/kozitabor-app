import React from 'react';

interface ContentCardProps {
  title: string;
  children: React.ReactNode;
}

export const ContentCard: React.FC<ContentCardProps> = ({ title, children }) => (
  <div className="animate-fade-in w-full max-w-[25rem] mx-auto flex flex-col items-center">
          
        {/* CARD */}
        <div className="w-full rounded-[1.875rem] border p-8 mb-8
                        bg-gradient-to-br from-[#fffcf0] to-[#f4e4bc] border-[#C5A059] shadow-xl
                        dark:from-[#3c2a21] dark:to-[#2b1e16] dark:border-[#C5A059]/40">
            
            {/* TITLE */}
            <h1 className="font-cinzel text-3xl mb-8 text-[#3e3028] dark:text-[#C5A059] text-center tracking-widest drop-shadow-md">
                {title}
            </h1>

            {/* CONTENT */}
            {children}

        </div>
    </div>
);