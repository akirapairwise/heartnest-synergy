
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
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 w-full">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
        className="w-full sm:w-auto transition-all hover:bg-secondary/10 text-base"
        aria-label="Cancel"
        style={{ fontSize: '16px' }}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full sm:w-auto mb-2 sm:mb-0 transition-all hover:scale-[1.02] text-base bg-primary"
        aria-label={goal ? "Update goal" : "Create goal"}
        style={{ fontSize: '16px' }}
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
