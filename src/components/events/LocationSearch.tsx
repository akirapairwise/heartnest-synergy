
import React, { useState, useEffect, useRef } from 'react';
import { useLocationSearch, GeocodingResult } from '@/utils/googleMapsUtils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { MapPin, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationSearchProps {
  value: string | undefined;
  onLocationSelect: (location: GeocodingResult | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  popoverWidth?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onLocationSelect,
  placeholder = "Search for a location",
  disabled = false,
  className,
  popoverWidth = "350px"
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [debouncedValue, setDebouncedValue] = useState(inputValue);
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  const { searchLocations, searchResults, isLoading, clearResults } = useLocationSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle debouncing of input value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Search for locations when debounced value changes
  useEffect(() => {
    if (debouncedValue) {
      searchLocations(debouncedValue);
    }
  }, [debouncedValue, searchLocations]);

  // Reset input value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const handleSelect = (item: GeocodingResult) => {
    setSelectedLocation(item);
    setInputValue(item.address);
    onLocationSelect(item);
    setOpen(false);
    clearResults();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (!newValue) {
      onLocationSelect(null);
      setSelectedLocation(null);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedLocation(null);
    onLocationSelect(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "w-full rounded-lg focus:ring-primary transition-all",
                selectedLocation && "pr-10"
              )}
              onFocus={() => setOpen(true)}
              aria-expanded={open}
            />
            {selectedLocation && inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                <span className="sr-only">Clear</span>
                ×
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: popoverWidth }}
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Search for a location..."
              value={inputValue}
              onValueChange={setInputValue}
              className="h-9"
              autoFocus 
            />
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && (
              <>
                <CommandEmpty>No locations found</CommandEmpty>
                <CommandGroup>
                  {searchResults.map((item) => (
                    <CommandItem
                      key={item.placeId || item.address}
                      value={item.address}
                      onSelect={() => handleSelect(item)}
                      className="py-2 cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm">{item.address}</span>
                        </div>
                        {selectedLocation?.address === item.address && (
                          <Check className="h-4 w-4 ml-auto text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationSearch;
