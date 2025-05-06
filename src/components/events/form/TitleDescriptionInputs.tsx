
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface TitleDescriptionInputsProps {
  form: UseFormReturn<any>;
}

const TitleDescriptionInputs: React.FC<TitleDescriptionInputsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Event Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter event title" 
                {...field} 
                className="rounded-lg text-base focus:ring-primary focus:border-primary transition-all"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Description (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add some details about your event" 
                className="min-h-[80px] sm:min-h-[100px] rounded-lg focus:ring-primary focus:border-primary transition-all resize-none"
                {...field} 
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default TitleDescriptionInputs;
