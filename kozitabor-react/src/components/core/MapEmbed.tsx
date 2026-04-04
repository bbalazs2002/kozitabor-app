import React from 'react';
import { useTheme } from '../../context/core/ThemeContext';

interface MapEmbedProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export const MapEmbed: React.FC<MapEmbedProps> = ({ lat, lng, zoom = 15 }) => {
  const { colors } = useTheme();

  // Standard Google Maps Embed URL a koordinátákkal
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <div 
      className="w-full h-64 rounded-[1.875rem] overflow-hidden border shadow-lg mb-6 relative z-10"
      style={{ 
        borderColor: colors.border,
        backgroundColor: colors.cardBgGradient.from
      }}
    >
      <iframe
        title="Helyszín térképe"
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};