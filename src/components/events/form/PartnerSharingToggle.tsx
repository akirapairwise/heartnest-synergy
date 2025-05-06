
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Info, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { UseFormReturn } from 'react-hook-form';

interface PartnerSharingToggleProps {
  form: UseFormReturn<any>;
}

const PartnerSharingToggle: React.FC<PartnerSharingToggleProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="shared_with_partner"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between p-3 sm:p-4 rounded-lg border bg-muted/20">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <FormLabel className="text-sm sm:text-base cursor-pointer">Share with Partner</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full ml-2">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    When turned on, this event will appear in your partner's calendar too.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-primary"
              />
              <AnimatePresence>
                {field.value && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center"
                  >
                    <Users className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PartnerSharingToggle;
