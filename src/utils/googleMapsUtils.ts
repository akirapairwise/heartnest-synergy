
import { useEffect, useState, useCallback, useRef } from 'react';

export interface GeocodingResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
}

// API key will be loaded from environment variable in Supabase
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Load Google Maps API script dynamically
export const loadGoogleMapsApi = (): Promise<void> => {
  if (window.google?.maps) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      // Wait for the existing script to load
      const checkGoogleExists = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkGoogleExists);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load'));

    document.head.appendChild(script);
  });
};

// Geocode an address to get coordinates
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  try {
    if (!window.google?.maps) {
      await loadGoogleMapsApi();
    }

    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            address: results[0].formatted_address,
            coordinates: {
              lat: location.lat(),
              lng: location.lng()
            },
            placeId: results[0].place_id
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Custom hook for location search with Google Places Autocomplete
export const useLocationSearch = () => {
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await loadGoogleMapsApi();
        if (window.google?.maps) {
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
          geocoderRef.current = new google.maps.Geocoder();
        }
      } catch (e) {
        setError('Failed to load Google Maps API');
      }
    };

    initializeServices();
  }, []);

  // Search for locations using Places Autocomplete
  const searchLocations = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (!autocompleteServiceRef.current) {
        await loadGoogleMapsApi();
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        geocoderRef.current = new google.maps.Geocoder();
      }

      const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteServiceRef.current!.getPlacePredictions(
          {
            input: query,
            types: ['address', 'establishment', 'geocode']
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              reject(new Error(`Places API error: ${status}`));
            }
          }
        );
      });

      // Get location details for the top 5 predictions
      const locationResults = await Promise.all(
        predictions.slice(0, 5).map(async (prediction) => {
          if (!geocoderRef.current) {
            geocoderRef.current = new google.maps.Geocoder();
          }

          return new Promise<GeocodingResult>((resolve, reject) => {
            geocoderRef.current!.geocode(
              { placeId: prediction.place_id },
              (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  const location = results[0].geometry.location;
                  resolve({
                    address: prediction.description,
                    coordinates: {
                      lat: location.lat(),
                      lng: location.lng()
                    },
                    placeId: prediction.place_id
                  });
                } else {
                  reject(new Error(`Geocoder error: ${status}`));
                }
              }
            );
          });
        })
      );

      setSearchResults(locationResults);
    } catch (e) {
      console.error('Location search error:', e);
      setError('Failed to search for locations');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchLocations,
    searchResults,
    isLoading,
    error,
    clearResults: () => setSearchResults([])
  };
};

// Get static map URL for a location
export const getStaticMapUrl = (lat: number, lng: number, zoom: number = 15, width: number = 400, height: number = 200): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
};

// Get Google Maps directions URL
export const getDirectionsUrl = (lat: number, lng: number, locationName?: string): string => {
  if (locationName) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationName)}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};
