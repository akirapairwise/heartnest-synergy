
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Heart, MessageSquare, Target, Wallet } from 'lucide-react';

const ProfileSettings = () => {
  const { profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    love_language: profile?.love_language || '',
    communication_style: profile?.communication_style || '',
    emotional_needs: profile?.emotional_needs || '',
    relationship_goals: profile?.relationship_goals || '',
    financial_attitude: profile?.financial_attitude || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        toast.error('Failed to update profile', {
          description: error.message
        });
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="fullName">Full Name</Label>
          </div>
          <Input
            id="fullName"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="Your full name"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="location">Location</Label>
          </div>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="City, Country"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Tell us about yourself..."
          className="min-h-[100px]"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="loveLanguage">Love Language</Label>
        </div>
        <Select
          value={formData.love_language}
          onValueChange={(value) => handleChange('love_language', value)}
        >
          <SelectTrigger id="loveLanguage">
            <SelectValue placeholder="Select your love language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="words_of_affirmation">Words of Affirmation</SelectItem>
            <SelectItem value="quality_time">Quality Time</SelectItem>
            <SelectItem value="receiving_gifts">Receiving Gifts</SelectItem>
            <SelectItem value="acts_of_service">Acts of Service</SelectItem>
            <SelectItem value="physical_touch">Physical Touch</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="communicationStyle">Communication Style</Label>
        </div>
        <Select
          value={formData.communication_style}
          onValueChange={(value) => handleChange('communication_style', value)}
        >
          <SelectTrigger id="communicationStyle">
            <SelectValue placeholder="Select your communication style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="analytical">Analytical</SelectItem>
            <SelectItem value="intuitive">Intuitive</SelectItem>
            <SelectItem value="functional">Functional</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="emotionalNeeds">Emotional Needs</Label>
        <Textarea
          id="emotionalNeeds"
          value={formData.emotional_needs}
          onChange={(e) => handleChange('emotional_needs', e.target.value)}
          placeholder="Describe your emotional needs..."
          className="min-h-[80px]"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="relationshipGoals">Relationship Goals</Label>
        </div>
        <Select
          value={formData.relationship_goals}
          onValueChange={(value) => handleChange('relationship_goals', value)}
        >
          <SelectTrigger id="relationshipGoals">
            <SelectValue placeholder="Select your relationship goals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="marriage">Marriage</SelectItem>
            <SelectItem value="long_term">Long-term Commitment</SelectItem>
            <SelectItem value="family">Starting a Family</SelectItem>
            <SelectItem value="travel">Travel Together</SelectItem>
            <SelectItem value="growth">Personal Growth</SelectItem>
            <SelectItem value="balance">Work-Life Balance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="financialAttitude">Financial Attitude</Label>
        </div>
        <Select
          value={formData.financial_attitude}
          onValueChange={(value) => handleChange('financial_attitude', value)}
        >
          <SelectTrigger id="financialAttitude">
            <SelectValue placeholder="Select your financial attitude" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="saver">Saver</SelectItem>
            <SelectItem value="spender">Spender</SelectItem>
            <SelectItem value="investor">Investor</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="avoider">Avoider</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Changes...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  );
};

export default ProfileSettings;
