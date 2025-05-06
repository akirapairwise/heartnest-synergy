
import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { getStaticMapUrl, getDirectionsUrl, loadGoogleMapsApi, geocodeAddress } from '@/utils/googleMapsUtils';

type LocationMapPreviewProps = {
  locationName: string;
  coordinates?: { lat: number; lng: number };
  className?: string;
};

const LocationMapPreview: React.FC<LocationMapPreviewProps> = ({ 
  locationName, 
  coordinates: initialCoordinates,
  className = ""
}) => {
  const [coordinates, setCoordinates] = useState(initialCoordinates);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // If coordinates aren't provided but we have a location name, try to geocode it
  useEffect(() => {
    const getCoordinates = async () => {
      if (!initialCoordinates && locationName) {
        setIsLoading(true);
        try {
          const result = await geocodeAddress(locationName);
          if (result) {
            setCoordinates(result.coordinates);
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    getCoordinates();
  }, [locationName, initialCoordinates]);

  // Try to load the Google Maps API
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMapsApi();
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
      }
    };
    
    initMap();
  }, []);

  if (!locationName && !coordinates) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>No location provided</span>
      </div>
    );
  }

  // If we have coordinates, create a Google Maps URL
  const googleMapsUrl = coordinates 
    ? getDirectionsUrl(coordinates.lat, coordinates.lng, locationName)
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;
  
  // Create a static map image URL if we have coordinates
  const mapImageUrl = coordinates 
    ? getStaticMapUrl(coordinates.lat, coordinates.lng) 
    : '';

  return (
    <div className={`mt-3 mb-2 ${className}`}>
      <a 
        href={googleMapsUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative overflow-hidden rounded-md bg-slate-100 h-40 flex items-center justify-center">
          {/* Static Map Image */}
          {coordinates && mapLoaded && !isLoading && (
            <img 
              src={mapImageUrl}
              alt={`Map of ${locationName}`}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
            </div>
          )}
          
          {/* Fallback or overlay with location name */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white" />
                <span className="font-medium line-clamp-1">{locationName}</span>
              </div>
              <ExternalLink className="h-4 w-4 text-white/80" />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default LocationMapPreview;
