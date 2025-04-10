
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { redeemPartnerCode } from '@/services/partners/partnerCodeService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  code: z.string()
    .min(6, { message: "Partner code must be at least 6 characters." })
    .max(8, { message: "Partner code cannot exceed 8 characters." })
    .refine(val => /^[A-Z0-9]+$/.test(val.toUpperCase()), {
      message: "Code can only contain letters and numbers."
    })
});

const PartnerCodeRedeemer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ""
    }
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to connect with a partner");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await redeemPartnerCode(user.id, values.code);
      
      if (error) {
        form.setError("code", { message: error.message });
        return;
      }
      
      // Refresh user profile to get the updated partner_id
      await fetchUserProfile(user.id);
      
      toast.success("Successfully connected with your partner!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error redeeming partner code:', error);
      toast.error(error.message || "Failed to connect with your partner. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Enter Partner Code</CardTitle>
        <CardDescription>
          Connect with your partner by entering their code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Code</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="Enter code (e.g. 3X7B21)" 
                      className="text-center font-mono uppercase"
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    This is the code your partner generated and shared with you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect with Partner
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PartnerCodeRedeemer;
