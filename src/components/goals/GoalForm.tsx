
import React, { useRef, useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Goal } from '@/types/goals';
import { GoalFormValues, goalCategories } from './GoalFormSchema';
import MilestoneInput from './MilestoneInput';
import DeadlinePicker from './DeadlinePicker';
import PartnerSharingOption from './PartnerSharingOption';
import GoalFormActions from './GoalFormActions';
import useGoalForm from '@/hooks/useGoalForm';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface GoalFormProps {
  goal?: Goal;
  isSubmitting: boolean;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  onCancel: () => void;
}

export const GoalForm = (props: GoalFormProps) => {
  const { form, hasSharingOption, handleSubmit, onCancel, isSubmitting, goal } = useGoalForm(props);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Handle auto-scrolling when an input field gets focus
  const handleFocusScroll = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target) {
      // Use setTimeout to ensure the keyboard has time to open on mobile
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };
  
  return (
    <ScrollArea className="max-h-[calc(100vh-120px)] px-1 overflow-y-auto" style={{ minHeight: 'auto', paddingBottom: '80px' }}>
      <Form {...form}>
        <form 
          ref={formRef}
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-4 md:space-y-6 max-w-[95%] sm:max-w-full mx-auto pb-24 sm:pb-16"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Goal Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter goal title..." 
                    {...field} 
                    className="w-full focus:ring-2 focus:ring-primary/30 transition-all text-base"
                    aria-label="Goal title"
                    onFocus={handleFocusScroll}
                    style={{ fontSize: '16px', maxWidth: '100%' }}
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
                <FormLabel className="text-base">Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What do you want to achieve? Be specific..."
                    className="min-h-20 sm:min-h-24 resize-none focus:ring-2 focus:ring-primary/30 transition-all text-base"
                    {...field}
                    aria-label="Goal description"
                    onFocus={handleFocusScroll}
                    style={{ fontSize: '16px' }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger 
                        className="focus:ring-2 focus:ring-primary/30 transition-all text-base" 
                        aria-label="Goal category"
                        style={{ fontSize: '16px' }}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" className="z-50 min-w-[8rem] bg-background border">
                      {goalCategories.map((category) => (
                        <SelectItem 
                          key={category.value} 
                          value={category.value}
                          className="text-base"
                          style={{ fontSize: '16px' }}
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DeadlinePicker form={form} />
          </div>
          
          {/* Milestones Section */}
          <div>
            <FormLabel className="text-base mb-2 block">Milestones</FormLabel>
            <MilestoneInput form={form} />
          </div>
          
          {hasSharingOption && (
            <>
              <Separator className="my-4" />
              <PartnerSharingOption form={form} hasSharingOption={hasSharingOption} />
            </>
          )}
          
          <div className="pt-4 sticky bottom-0 bg-background z-10">
            <GoalFormActions 
              isSubmitting={isSubmitting} 
              onCancel={onCancel} 
              goal={goal} 
            />
          </div>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default GoalForm;
export type { GoalFormValues };
