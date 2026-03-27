// src/components/MapEmbed.tsx
import React from 'react';

interface MapEmbedProps {
  lat: number;   // Szélesség: pl. 47.1234
  lng: number;   // Hosszúság: pl. 19.5678
  zoom?: number; // Opcionális nagyítás (alapértelmezetten 15)
}

export const MapEmbed: React.FC<MapEmbedProps> = ({ lat, lng, zoom = 15 }) => {
  // Ez az URL struktúra kényszeríti a jelölőt a koordinátákra
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <div className="w-full h-64 rounded-[1.875rem] overflow-hidden border border-[#C5A059] shadow-lg mb-6 relative z-10 bg-[#f4e4bc]/20">
      <iframe
        title="Tábor helyszíne"
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="dark:opacity-80 dark:contrast-110 dark:invert-[0.05]"
      ></iframe>
    </div>
  );
};