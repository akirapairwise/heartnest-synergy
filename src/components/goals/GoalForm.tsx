
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { createGoal } from '@/services/goalService';
import { Goal } from '@/types/goals';

const goalCategories = [
  { value: 'communication', label: 'Communication' },
  { value: 'quality-time', label: 'Quality Time' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'understanding', label: 'Understanding' },
  { value: 'growth', label: 'Growth' },
  { value: 'intimacy', label: 'Intimacy' },
];

const FormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  category: z.string().optional(),
  deadline: z.date().optional(),
  isShared: z.boolean().default(false),
  status: z.string().default('pending'),
  milestones: z.array(z.string()).default([]),
});

// Export this type so it can be used in other components
export type GoalFormValues = z.infer<typeof FormSchema>;

export interface GoalFormProps {
  goal?: Goal;
  isSubmitting: boolean;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  onCancel: () => void;
}

export const GoalForm = ({ goal, onSubmit, onCancel, isSubmitting }: GoalFormProps) => {
  const { profile } = useAuth();
  const [hasSharingOption, setHasSharingOption] = useState(false);
  
  // Check if user has a partner to enable sharing
  useEffect(() => {
    setHasSharingOption(!!profile?.partner_id);
  }, [profile]);
  
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: goal?.title || '',
      description: goal?.description || '',
      category: goal?.category || undefined,
      deadline: goal?.deadline ? new Date(goal.deadline) : undefined,
      isShared: goal?.is_shared || false,
      status: goal?.status || 'pending',
      milestones: goal?.milestones || [],
    },
  });
  
  const handleSubmit = async (values: GoalFormValues) => {
    await onSubmit(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter goal title..." {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What do you want to achieve? Be specific..."
                  className="min-h-24 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
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
          
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Deadline (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {hasSharingOption && (
          <>
            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="isShared"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Share with Partner</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Your partner will be able to see and track this goal with you
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}
        
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GoalForm;
