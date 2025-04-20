
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AvatarUploader from './AvatarUploader';
import { Separator } from "@/components/ui/separator";

const ProfileSettings = () => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    // Basic Info
    full_name: profile?.full_name || '',
    nickname: profile?.nickname || '',
    pronouns: profile?.pronouns || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    
    // Relationship Details
    relationship_status: profile?.relationship_status || '',
    relationship_start_date: profile?.relationship_start_date || '',
    living_together: profile?.living_together || '',
    interaction_frequency: profile?.interaction_frequency || '',
    
    // Communication Preferences
    love_language: profile?.love_language || '',
    communication_style: profile?.communication_style || '',
    preferred_communication: profile?.preferred_communication || '',
    emotional_needs: profile?.emotional_needs || '',
    
    // Goals & Improvement
    relationship_goals: profile?.relationship_goals || '',
    areas_to_improve: profile?.areas_to_improve || [],
    financial_attitude: profile?.financial_attitude || '',
    conflict_resolution_style: profile?.conflict_resolution_style || '',
    
    // Visibility Settings
    isMoodVisibleToPartner: profile?.mood_settings?.isVisibleToPartner !== false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isMoodVisibleToPartner: checked
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const moodSettings = {
        ...(profile?.mood_settings || {}),
        isVisibleToPartner: formData.isMoodVisibleToPartner
      };
      
      await updateProfile({
        ...formData,
        mood_settings: moodSettings,
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            Upload a profile photo to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUploader />
        </CardContent>
      </Card>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="Your preferred name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pronouns">Pronouns</Label>
                <Select 
                  value={formData.pronouns} 
                  onValueChange={(value) => handleSelectChange('pronouns', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your pronouns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he/him">He/Him</SelectItem>
                    <SelectItem value="she/her">She/Her</SelectItem>
                    <SelectItem value="they/them">They/Them</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">About Me</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relationship Details</CardTitle>
            <CardDescription>Information about your relationship</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship_status">Relationship Status</Label>
                <Select 
                  value={formData.relationship_status} 
                  onValueChange={(value) => handleSelectChange('relationship_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dating">Dating</SelectItem>
                    <SelectItem value="engaged">Engaged</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relationship_start_date">Relationship Start Date</Label>
                <Input
                  id="relationship_start_date"
                  name="relationship_start_date"
                  type="date"
                  value={formData.relationship_start_date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="living_together">Living Situation</Label>
                <Select 
                  value={formData.living_together} 
                  onValueChange={(value) => handleSelectChange('living_together', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select living situation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="together">Living Together</SelectItem>
                    <SelectItem value="separate">Living Separately</SelectItem>
                    <SelectItem value="planning">Planning to Move In</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interaction_frequency">Interaction Frequency</Label>
                <Select 
                  value={formData.interaction_frequency} 
                  onValueChange={(value) => handleSelectChange('interaction_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication & Preferences</CardTitle>
            <CardDescription>Your communication style and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="love_language">Love Language</Label>
                <Select 
                  value={formData.love_language} 
                  onValueChange={(value) => handleSelectChange('love_language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select love language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="words">Words of Affirmation</SelectItem>
                    <SelectItem value="acts">Acts of Service</SelectItem>
                    <SelectItem value="gifts">Receiving Gifts</SelectItem>
                    <SelectItem value="time">Quality Time</SelectItem>
                    <SelectItem value="touch">Physical Touch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="communication_style">Communication Style</Label>
                <Select 
                  value={formData.communication_style} 
                  onValueChange={(value) => handleSelectChange('communication_style', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="indirect">Indirect</SelectItem>
                    <SelectItem value="emotional">Emotional</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emotional_needs">Emotional Needs</Label>
                <Textarea
                  id="emotional_needs"
                  name="emotional_needs"
                  value={formData.emotional_needs}
                  onChange={handleInputChange}
                  placeholder="Describe your emotional needs"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred_communication">Preferred Communication Method</Label>
                <Select 
                  value={formData.preferred_communication} 
                  onValueChange={(value) => handleSelectChange('preferred_communication', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In Person</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals & Improvement</CardTitle>
            <CardDescription>Your relationship goals and areas for improvement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship_goals">Relationship Goals</Label>
                <Textarea
                  id="relationship_goals"
                  name="relationship_goals"
                  value={formData.relationship_goals}
                  onChange={handleInputChange}
                  placeholder="What are your relationship goals?"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conflict_resolution_style">Conflict Resolution Style</Label>
                <Select 
                  value={formData.conflict_resolution_style} 
                  onValueChange={(value) => handleSelectChange('conflict_resolution_style', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compromising">Compromising</SelectItem>
                    <SelectItem value="collaborating">Collaborating</SelectItem>
                    <SelectItem value="accommodating">Accommodating</SelectItem>
                    <SelectItem value="avoiding">Avoiding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="financial_attitude">Financial Attitude</Label>
                <Select 
                  value={formData.financial_attitude} 
                  onValueChange={(value) => handleSelectChange('financial_attitude', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attitude" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saver">Saver</SelectItem>
                    <SelectItem value="spender">Spender</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control what your partner can see</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="mood-visibility"
                  checked={formData.isMoodVisibleToPartner}
                  onCheckedChange={handleToggleChange}
                />
                <Label htmlFor="mood-visibility">Share mood with my partner</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, your partner will be able to see your daily mood entries
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
