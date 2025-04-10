
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from 'react-router-dom';

/**
 * Component shown when the user already has a partner connected
 */
const AlreadyConnectedState = () => {
  const navigate = useNavigate();
  
  const handleSkip = () => {
    navigate('/dashboard');
  };
  
  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-center mb-4">
          <div className="bg-love-100 text-love-600 p-4 rounded-full">
            <Heart className="h-6 w-6" />
          </div>
        </div>
        <CardTitle>Already Connected</CardTitle>
        <CardDescription>You're already connected with a partner</CardDescription>
      </CardHeader>
      <CardContent className="text-center px-0">
        <p className="text-muted-foreground">
          You already have a partner connected to your account.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center px-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 hover:bg-love-50 hover:text-love-600 transition-all"
          onClick={handleSkip}
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AlreadyConnectedState;
