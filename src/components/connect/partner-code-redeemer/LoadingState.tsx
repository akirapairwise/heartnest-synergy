
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading state component for the partner code redeemer
 */
const LoadingState = () => {
  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 text-love-500 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
