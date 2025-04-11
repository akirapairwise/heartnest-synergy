
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { GoalFormValues } from './GoalFormSchema';

interface PartnerSharingOptionProps {
  form: UseFormReturn<GoalFormValues>;
  hasSharingOption: boolean;
}

export const PartnerSharingOption = ({ form, hasSharingOption }: PartnerSharingOptionProps) => {
  if (!hasSharingOption) return null;

  return (
    <FormField
      control={form.control}
      name="isShared"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Share this goal with my partner?</FormLabel>
            <div className="text-sm text-muted-foreground">
              {field.value ? 
                "This goal will be shared with your partner" : 
                "This goal will be kept private"}
            </div>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="data-[state=checked]:bg-primary"
              aria-label="Share goal with partner"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PartnerSharingOption;
