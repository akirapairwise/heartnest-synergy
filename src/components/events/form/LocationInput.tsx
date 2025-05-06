
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import LocationSearch from '../LocationSearch';
import LocationMapPreview from '../LocationMapPreview';
import { GeocodingResult } from '@/utils/googleMapsUtils';
import { UseFormReturn } from 'react-hook-form';

interface LocationInputProps {
  form: UseFormReturn<any>;
  onLocationSelect: (location: GeocodingResult | null) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ form, onLocationSelect }) => {
  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">Location (Optional)</FormLabel>
          <FormControl>
            <LocationSearch 
              value={field.value || ''}
              onLocationSelect={onLocationSelect}
              placeholder="Search for a location"
            />
          </FormControl>
          <FormMessage />
          {field.value && (
            <LocationMapPreview 
              locationName={field.value} 
              coordinates={form.getValues('locationCoords')}
              className="mt-2" 
            />
          )}
        </FormItem>
      )}
    />
  );
};

export default LocationInput;
