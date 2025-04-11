
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
import { CalendarIcon, Loader2, PlusCircle, X, Milestone } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

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
  const [newMilestone, setNewMilestone] = useState('');
  
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

  const addMilestone = () => {
    if (newMilestone.trim() === '') return;
    
    const currentMilestones = form.getValues('milestones') || [];
    form.setValue('milestones', [...currentMilestones, newMilestone]);
    setNewMilestone('');
  };

  const removeMilestone = (index: number) => {
    const currentMilestones = form.getValues('milestones') || [];
    const updatedMilestones = currentMilestones.filter((_, i) => i !== index);
    form.setValue('milestones', updatedMilestones);
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What do you want to achieve? Be specific..."
                  className="min-h-24 resize-none focus:ring-2 focus:ring-primary/30 transition-all"
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
                          "w-full pl-3 text-left font-normal focus:ring-2 focus:ring-primary/30 transition-all",
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
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Milestones Section */}
        <div className="space-y-3">
          <FormLabel>Milestones</FormLabel>
          <div className="flex space-x-2">
            <Input
              placeholder="Add milestone..."
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              className="flex-1 focus:ring-2 focus:ring-primary/30 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMilestone();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={addMilestone}
              variant="outline"
              className="flex-shrink-0"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          <FormField
            control={form.control}
            name="milestones"
            render={() => (
              <FormItem>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch('milestones')?.map((milestone, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="pl-3 pr-2 py-1.5 flex items-center gap-1 text-sm"
                    >
                      <Milestone className="h-3.5 w-3.5 mr-1" />
                      {milestone}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 p-0 ml-1 hover:bg-secondary/80 rounded-full"
                        onClick={() => removeMilestone(index)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm hover:shadow-md transition-all duration-200">
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
                      className="data-[state=checked]:bg-primary"
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
            className="transition-all hover:bg-secondary/10"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="transition-all hover:scale-[1.02]"
          >
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
