
import React from 'react';
import { MapPin } from 'lucide-react';

type LocationMapPreviewProps = {
  locationName: string;
  coordinates?: { lat: number; lng: number };
};

const LocationMapPreview: React.FC<LocationMapPreviewProps> = ({ locationName, coordinates }) => {
  if (!coordinates) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{locationName || "No specific location provided"}</span>
      </div>
    );
  }

  // Create a Google Maps URL for the coordinates
  const googleMapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
  
  // Create a static map image URL
  const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=15&size=400x200&markers=color:red%7C${coordinates.lat},${coordinates.lng}&key=`;

  return (
    <div className="mt-3 mb-2">
      <a 
        href={googleMapsUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative overflow-hidden rounded-md bg-slate-100 h-40 flex items-center justify-center">
          {/* Fallback map pin display if no API key is available */}
          <div className="absolute flex flex-col items-center justify-center text-center p-4">
            <MapPin className="h-8 w-8 text-love-500 mb-2" />
            <span className="text-sm font-medium">{locationName}</span>
            <span className="text-xs text-muted-foreground mt-1">Click to view on Google Maps</span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default LocationMapPreview;
