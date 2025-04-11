
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step1Props {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const Step1BasicInfo: React.FC<Step1Props> = ({ formData, handleChange }) => {
  return (
    <>
      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
      <div className="space-y-2 mb-4">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName" 
          placeholder="Your legal name" 
          value={formData.full_name || ''}
          onChange={(e) => handleChange('full_name', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2 mb-4">
        <Label htmlFor="nickname">
          Nickname <span className="text-xs text-muted-foreground">(What should we call you?)</span>
        </Label>
        <Input 
          id="nickname" 
          placeholder="Your preferred name" 
          value={formData.nickname || ''}
          onChange={(e) => handleChange('nickname', e.target.value.substring(0, 20))}
          maxLength={20}
        />
        {formData.nickname && (
          <div className="mt-2 text-sm text-muted-foreground animate-fade-in">
            <span>Preview: </span>
            <span className="font-medium text-primary">Welcome, {formData.nickname}!</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input 
            id="dob" 
            type="date" 
            onChange={(e) => handleChange('dob', e.target.value)}
            value={formData.dob || ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select 
            value={formData.gender || ''} 
            onValueChange={(value) => handleChange('gender', value)}
          >
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
      <div className="space-y-2 mt-4">
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          placeholder="City, Country" 
          value={formData.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>
      <div className="space-y-2 mt-4">
        <Label htmlFor="bio">Brief Bio</Label>
        <Textarea 
          id="bio" 
          placeholder="Tell us a bit about yourself..." 
          value={formData.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </>
  );
};

export default Step1BasicInfo;
