
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Goal } from '@/types/goals';

interface GoalFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  goal?: Goal;
}

export const GoalFormActions = ({ isSubmitting, onCancel, goal }: GoalFormActionsProps) => {
  return (
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
  );
};

export default GoalFormActions;
