
import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import TimePickerField from '../TimePickerField';
import { UseFormReturn } from 'react-hook-form';

interface DateTimeInputsProps {
  form: UseFormReturn<any>;
}

const DateTimeInputs: React.FC<DateTimeInputsProps> = ({ form }) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const DatePickerContent = (
    <Calendar
      mode="single"
      selected={form.getValues("event_date")}
      onSelect={(date) => date && form.setValue("event_date", date)}
      initialFocus
      className="p-3 pointer-events-auto"
    />
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <FormField
        control={form.control}
        name="event_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-base">Date</FormLabel>
            {isMobile ? (
              <Drawer>
                <DrawerTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "pl-3 text-left font-normal rounded-lg w-full",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </DrawerTrigger>
                <DrawerContent className="p-0">
                  <div className="p-4 bg-background">
                    <h4 className="font-medium text-center mb-4">Select Date</h4>
                    {DatePickerContent}
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "pl-3 text-left font-normal rounded-lg",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  {DatePickerContent}
                </PopoverContent>
              </Popover>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <TimePickerField form={form} />
    </div>
  );
};

export default DateTimeInputs;
