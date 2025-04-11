
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AvatarUploader = () => {
  const { user, profile, updateProfile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      
      const files = event.target.files;
      if (!files || files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 2MB.');
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WEBP).');
        return;
      }
      
      // Use a manual approach to track progress since onUploadProgress is not available
      setUploadProgress(30); // Set initial progress
      
      // Upload file to storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      setUploadProgress(70); // Update progress after upload
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      setUploadProgress(90); // Update progress
      
      // Update user profile with avatar URL
      if (publicUrl) {
        await updateProfile({ avatar_url: publicUrl });
        setAvatarUrl(publicUrl);
        toast.success('Avatar uploaded successfully!');
      }
      
      setUploadProgress(100); // Complete
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Error uploading avatar');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after a brief delay
    }
  };
  
  const removeAvatar = async () => {
    try {
      setIsUploading(true);
      
      if (!profile?.avatar_url) {
        return;
      }
      
      // Extract file path from URL
      const urlParts = profile.avatar_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Remove file from storage (if it exists)
      if (fileName) {
        await supabase.storage
          .from('avatars')
          .remove([fileName]);
      }
      
      // Update profile to remove avatar_url
      await updateProfile({ avatar_url: null });
      setAvatarUrl(null);
      toast.success('Avatar removed successfully');
      
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast.error(error.message || 'Error removing avatar');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!profile?.full_name) return 'U';
    return profile.full_name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24 border-2 border-primary/20">
        <AvatarImage src={avatarUrl || undefined} alt="Profile" />
        <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </>
          )}
        </Button>
        
        {avatarUrl && (
          <Button 
            variant="outline" 
            size="sm"
            disabled={isUploading}
            onClick={removeAvatar}
          >
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
        
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          className="hidden"
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Upload a profile picture (max 2MB)
      </p>
    </div>
  );
};

export default AvatarUploader;
