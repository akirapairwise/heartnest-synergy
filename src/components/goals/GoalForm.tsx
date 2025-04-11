
import React from 'react';
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
  
  return (
    <ScrollArea className="max-h-[80vh] px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 md:space-y-6">
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
                    className="w-full focus:ring-2 focus:ring-primary/30 transition-all"
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
                    className="min-h-20 sm:min-h-24 resize-none focus:ring-2 focus:ring-primary/30 transition-all"
                    {...field}
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
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-2 focus:ring-primary/30 transition-all">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goalCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
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
          
          <GoalFormActions 
            isSubmitting={isSubmitting} 
            onCancel={onCancel} 
            goal={goal} 
          />
        </form>
      </Form>
    </ScrollArea>
  );
};

export default GoalForm;
export type { GoalFormValues };
