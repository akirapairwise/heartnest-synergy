
// Add Google Maps API types declaration
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
  namespace google {
    namespace maps {
      class Geocoder {
        geocode(request: { address: string; }, callback: (results: any[], status: any) => void): void;
      }
      class DirectionsService {
        route(request: any, callback: (result: any, status: any) => void): void;
      }
      class Map {
        constructor(mapDiv: HTMLElement, options: any);
      }
      const LatLng: new (lat: number, lng: number) => any;
      namespace places {
        class Autocomplete {
          constructor(input: HTMLInputElement, options?: any);
          addListener(event: string, callback: () => void): void;
          getPlace(): any;
        }
      }
      enum TravelMode {
        DRIVING,
        BICYCLING,
        TRANSIT,
        WALKING
      }
    }
  }
}

// Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface GeocodingResult {
  address: string;
  placeId?: string;
  coordinates: { lat: number; lng: number };
}

let mapsApiLoaded = false;
let mapsApiLoadPromise: Promise<void> | null = null;

export const loadGoogleMapsApi = (): Promise<void> => {
  if (mapsApiLoaded) {
    return Promise.resolve();
  }

  if (mapsApiLoadPromise) {
    return mapsApiLoadPromise;
  }

  mapsApiLoadPromise = new Promise((resolve, reject) => {
    window.initMap = () => {
      mapsApiLoaded = true;
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.onerror = () => reject(new Error('Google Maps API failed to load'));
    document.head.appendChild(script);
  });

  return mapsApiLoadPromise;
};

export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  try {
    await loadGoogleMapsApi();
    
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results: any[], status: any) => {
        if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
          const place = results[0];
          const location = place.geometry.location;
          
          resolve({
            address: place.formatted_address,
            placeId: place.place_id,
            coordinates: {
              lat: location.lat(),
              lng: location.lng()
            }
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

export const useLocationSearch = () => {
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      await loadGoogleMapsApi();
      
      const result = await geocodeAddress(query);
      if (result) {
        setSearchResults([result]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isLoading,
    searchLocations,
    clearResults
  };
};

export const getStaticMapUrl = (lat: number, lng: number, zoom: number = 14, width: number = 600, height: number = 300): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
};

export const getDirectionsUrl = (lat: number, lng: number, locationName?: string): string => {
  const destination = locationName ? `destination=${encodeURIComponent(locationName)}` : `destination=${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&${destination}`;
};

// Don't forget to import useState at the top
import { useState } from 'react';
