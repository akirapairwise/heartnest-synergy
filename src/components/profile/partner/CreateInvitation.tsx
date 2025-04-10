
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Link } from 'lucide-react';

interface CreateInvitationProps {
  onCreateInvite: () => Promise<void>;
  isLoading: boolean;
}

const CreateInvitation = ({ onCreateInvite, isLoading }: CreateInvitationProps) => {
  return (
    <div className="p-6 rounded-lg border flex flex-col items-center justify-center text-center">
      <p className="mb-4 text-muted-foreground">You haven't connected with a partner yet.</p>
      <Button onClick={onCreateInvite} disabled={isLoading} className="gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Link className="h-4 w-4" />
            Create Invitation Link
          </>
        )}
      </Button>
    </div>
  );
};

export default CreateInvitation;
