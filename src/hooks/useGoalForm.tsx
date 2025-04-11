
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Goal } from '@/types/goals';
import { FormSchema, GoalFormValues } from '@/components/goals/GoalFormSchema';
import { useAuth } from '@/contexts/AuthContext';

interface UseGoalFormProps {
  goal?: Goal;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const useGoalForm = ({ goal, onSubmit, onCancel, isSubmitting }: UseGoalFormProps) => {
  const { profile } = useAuth();
  const [hasSharingOption, setHasSharingOption] = useState(!!profile?.partner_id);
  
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
  
  return {
    form,
    hasSharingOption,
    handleSubmit,
    onCancel,
    isSubmitting,
    goal
  };
};

export default useGoalForm;
