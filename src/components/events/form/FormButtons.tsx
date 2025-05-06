
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormButtonsProps {
  onCancel: () => void;
  isEditMode: boolean;
}

const FormButtons: React.FC<FormButtonsProps> = ({ onCancel, isEditMode }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="rounded-lg"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="gradient"
        className="rounded-lg"
      >
        {isEditMode ? 'Update Event' : 'Create Event'}
      </Button>
    </div>
  );
};

export default FormButtons;
