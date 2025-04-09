
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Sparkles } from "lucide-react";

const OnboardingForm = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate profile completion
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile completed!",
        description: "Your profile has been set up. You're ready to start your relationship journey.",
      });
      navigate('/connect');
    }, 1500);
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-heading">Let's Set Up Your Profile</CardTitle>
        <CardDescription>
          Tell us about yourself to get the most out of HeartNest
        </CardDescription>
        <div className="flex justify-center mt-4 space-x-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`h-2 w-12 rounded-full transition-all ${
                i === step ? 'bg-primary w-16' : i < step ? 'bg-muted-foreground/40' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, Country" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Brief Bio</Label>
              <Textarea id="bio" placeholder="Tell us a bit about yourself..." />
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-medium">Relationship Preferences</h3>
            <div className="space-y-2">
              <Label htmlFor="relationship-status">Current Relationship Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="dating">Dating</SelectItem>
                  <SelectItem value="engaged">Engaged</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="complicated">It's complicated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="communication-style">Communication Style</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct communicator</SelectItem>
                  <SelectItem value="emotional">Emotional communicator</SelectItem>
                  <SelectItem value="analytical">Analytical thinker</SelectItem>
                  <SelectItem value="reserved">Reserved communicator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="love-languages">Primary Love Language</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words of Affirmation</SelectItem>
                  <SelectItem value="touch">Physical Touch</SelectItem>
                  <SelectItem value="gifts">Receiving Gifts</SelectItem>
                  <SelectItem value="time">Quality Time</SelectItem>
                  <SelectItem value="service">Acts of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goals">What are your relationship goals?</Label>
              <Textarea 
                id="goals" 
                placeholder="What are you hoping to improve or achieve in your relationship?" 
              />
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-medium">Personalize Your Experience</h3>
            
            <div className="space-y-2">
              <Label htmlFor="interests">Your Interests & Hobbies</Label>
              <Textarea 
                id="interests" 
                placeholder="What do you enjoy doing in your free time?" 
              />
            </div>
            
            <div className="space-y-4">
              <Label>Notification Preferences</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="reminders" defaultChecked />
                  <Label htmlFor="reminders">Daily relationship reminders</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="tips" defaultChecked />
                  <Label htmlFor="tips">Relationship tips and advice</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="partner-updates" defaultChecked />
                  <Label htmlFor="partner-updates">Partner activity updates</Label>
                </div>
              </div>
            </div>
            
            <div className="relative p-4 border rounded-lg bg-gradient-to-r from-harmony-50 to-love-50">
              <div className="absolute top-3 right-3">
                <Sparkles className="h-5 w-5 text-harmony-500" />
              </div>
              <h4 className="font-medium text-harmony-700">AI-Powered Insights</h4>
              <p className="text-sm text-muted-foreground mt-1">
                HeartNest uses AI to provide personalized relationship insights and recommendations.
              </p>
              <div className="mt-3 flex items-center space-x-2">
                <input type="checkbox" id="ai-consent" defaultChecked />
                <Label htmlFor="ai-consent" className="text-sm">I consent to AI-powered features</Label>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <Separator className="my-2" />
      
      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Cancel
          </Button>
        )}
        
        {step < 3 ? (
          <Button className="btn-primary-gradient" onClick={nextStep}>
            Continue
          </Button>
        ) : (
          <Button 
            className="btn-primary-gradient" 
            onClick={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Complete Profile"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OnboardingForm;
