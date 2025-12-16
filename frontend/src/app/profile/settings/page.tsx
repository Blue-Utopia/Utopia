'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Container,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Paper,
  Rating,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Avatar,
} from '@mui/material';
import { Add, Delete, CheckCircle, Star } from '@mui/icons-material';

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      email
      username
      displayName
      bio
      avatar
      location
      timezone
      walletAddress
      role
      skills {
        id
        skill {
          id
          name
          category
        }
        level
        yearsOfExperience
        isVerified
      }
      portfolioItems {
        id
        title
        description
        url
        images
        tags
        createdAt
      }
      jobsAsClient {
        id
        title
        status
        budget
        currency
        createdAt
        completedAt
      }
      jobsAsDeveloper {
        id
        title
        status
        budget
        currency
        createdAt
        completedAt
      }
      reviewsReceived {
        id
        rating
        comment
        reviewer {
          displayName
          username
        }
        createdAt
      }
      averageRating
      totalJobs
      completionRate
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      displayName
      bio
      avatar
      location
      timezone
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

const CHANGE_USERNAME = gql`
  mutation ChangeUsername($newUsername: String!) {
    changeUsername(newUsername: $newUsername) {
      id
      username
    }
  }
`;

const GET_SKILLS = gql`
  query GetSkills($category: String) {
    skills(category: $category) {
      id
      name
      category
      description
    }
  }
`;

const ADD_SKILL = gql`
  mutation AddSkill($input: AddSkillInput!) {
    addSkill(input: $input) {
      id
      skill {
        id
        name
        category
      }
      level
      yearsOfExperience
    }
  }
`;

const REMOVE_SKILL = gql`
  mutation RemoveSkill($skillId: ID!) {
    removeSkill(skillId: $skillId)
  }
`;

type TabType = 'account' | 'profile' | 'skills' | 'portfolio' | 'work-history' | 'wallet';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, authenticate, refreshUser } = useAuth();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [activeTab, setActiveTab] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { data, loading, refetch } = useQuery(GET_USER_PROFILE, {
    skip: !isAuthenticated,
  });

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [changePassword] = useMutation(CHANGE_PASSWORD);
  const [changeUsername] = useMutation(CHANGE_USERNAME);
  const [addSkill] = useMutation(ADD_SKILL);
  const [removeSkill] = useMutation(REMOVE_SKILL);

  const { data: skillsData } = useQuery(GET_SKILLS);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleAuthenticate = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsAuthenticating(true);
    try {
      await authenticate();
      toast.success('Wallet linked successfully!');
    } catch (error) {
      // Error is already handled in useAuth hook
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading...</Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated || !data?.me) {
    return null;
  }

  const user = data.me;
  const tabs = ['Account', 'Profile', 'Skills', 'Portfolio', 'Work History', 'Wallet'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
          Profile Settings
        </Typography>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              aria-label="profile settings tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab, index) => (
                <Tab key={tab} label={tab} id={`profile-tab-${index}`} aria-controls={`profile-tabpanel-${index}`} />
              ))}
            </Tabs>
          </Box>

          <CardContent>
            <TabPanel value={activeTab} index={0}>
              <AccountSettingsTab
                user={user}
                changePassword={changePassword}
                changeUsername={changeUsername}
                refetch={refetch}
              />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <ProfileInfoTab user={user} updateProfile={updateProfile} refetch={refetch} refreshUser={refreshUser} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <SkillsTab
                user={user}
                skills={skillsData?.skills || []}
                addSkill={addSkill}
                removeSkill={removeSkill}
                refetch={refetch}
              />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <PortfolioTab user={user} refetch={refetch} />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
              <WorkHistoryTab user={user} />
            </TabPanel>
            <TabPanel value={activeTab} index={5}>
              <WalletTab
                user={user}
                isConnected={isConnected}
                address={address}
                isAuthenticating={isAuthenticating}
                handleAuthenticate={handleAuthenticate}
                disconnect={disconnect}
              />
            </TabPanel>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// Account Settings Tab Component
function AccountSettingsTab({ user, changePassword, changeUsername, refetch }: any) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [usernameForm, setUsernameForm] = useState({
    newUsername: user.username || '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        variables: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usernameForm.newUsername || usernameForm.newUsername === user.username) {
      return;
    }

    setIsChangingUsername(true);
    try {
      await changeUsername({
        variables: { newUsername: usernameForm.newUsername },
      });
      toast.success('Username changed successfully!');
      await refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to change username');
    } finally {
      setIsChangingUsername(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Change Password */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <Box component="form" onSubmit={handlePasswordChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
          <TextField
            type="password"
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
            fullWidth
          />
          <TextField
            type="password"
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            required
            fullWidth
            inputProps={{ minLength: 8 }}
          />
          <TextField
            type="password"
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            required
            fullWidth
            inputProps={{ minLength: 8 }}
          />
          <Button type="submit" variant="contained" disabled={isChangingPassword} sx={{ alignSelf: 'flex-start' }}>
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Change Username */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Change Username
        </Typography>
        <Box component="form" onSubmit={handleUsernameChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
          <TextField
            label="New Username"
            value={usernameForm.newUsername}
            onChange={(e) => setUsernameForm({ newUsername: e.target.value })}
            required
            fullWidth
          />
          <Typography variant="body2" color="text.secondary">
            Current username: {user.username || 'Not set'}
          </Typography>
          <Button
            type="submit"
            variant="contained"
            disabled={isChangingUsername || usernameForm.newUsername === user.username}
            sx={{ alignSelf: 'flex-start' }}
          >
            {isChangingUsername ? 'Changing...' : 'Change Username'}
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Account Information */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {user.email && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Email
              </Typography>
              <Typography>{user.email}</Typography>
            </Box>
          )}
          {user.username && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Username
              </Typography>
              <Typography>{user.username}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// Helper function to compress and resize image
const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// Helper function to create circular crop
const createCircularCrop = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw image centered
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        ctx.drawImage(img, -offsetX, -offsetY, img.width, img.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create circular crop'));
              return;
            }
            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          },
          file.type,
          0.9
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// Profile Info Tab Component
function ProfileInfoTab({ user, updateProfile, refetch, refreshUser }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    bio: user.bio || '',
    location: user.location || '',
    timezone: user.timezone || '',
    avatar: user.avatar || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    setFormData({
      displayName: user.displayName || '',
      bio: user.bio || '',
      location: user.location || '',
      timezone: user.timezone || '',
      avatar: user.avatar || '',
    });
    setAvatarPreview(user.avatar || null);
  }, [user]);

  const processAndUploadImage = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Compress and resize image
      setUploadProgress(30);
      const compressedFile = await compressImage(file, 800, 800, 0.85);
      
      // Create circular crop
      setUploadProgress(60);
      const croppedFile = await createCircularCrop(compressedFile);

      setUploadProgress(80);
      const uploadFormData = new FormData();
      uploadFormData.append('file', croppedFile);

      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      // Use the avatar-specific endpoint that auto-updates the profile
      const response = await fetch(`${API_URL}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploadProgress(95);
      const result = await response.json();
      console.log('Upload result:', result);
      
      // Use fullUrl if available, otherwise construct it using API_URL
      // Prefer the fullUrl from server, but fallback to constructing from API_URL
      let avatarUrl = result.file.fullUrl || `${API_URL}${result.file.url}`;
      
      // Ensure URL is absolute (starts with http:// or https://)
      if (avatarUrl.startsWith('//')) {
        avatarUrl = `${window.location.protocol}${avatarUrl}`;
      } else if (avatarUrl.startsWith('/')) {
        // Relative URL - prepend API_URL
        avatarUrl = `${API_URL}${avatarUrl}`;
      }
      
      console.log('Avatar upload response:', result);
      console.log('Constructed avatar URL:', avatarUrl);
      console.log('API_URL:', API_URL);
      
      // Test image accessibility asynchronously (don't block or show errors)
      setTimeout(() => {
        const imgTest = new Image();
        imgTest.onload = () => {
          console.log('✅ Avatar image is accessible:', avatarUrl);
        };
        imgTest.onerror = () => {
          console.warn('⚠️ Avatar image may not be accessible:', avatarUrl);
          console.warn('Check: CORS settings, URL correctness, or server static file serving');
          // Don't show error toast - upload was successful, just log warning
        };
        imgTest.src = avatarUrl;
      }, 100);
      
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
      setAvatarPreview(avatarUrl);
      setUploadProgress(100);
      
      // Immediately update the auth context cache with new avatar
      // This ensures the header updates instantly without waiting for refetch
      const currentAuthData = queryClient.getQueryData(['auth']);
      if (currentAuthData && typeof currentAuthData === 'object' && 'user' in currentAuthData) {
        queryClient.setQueryData(['auth'], {
          ...currentAuthData,
          user: {
            ...(currentAuthData as any).user,
            avatar: avatarUrl,
          },
        });
        console.log('✅ Auth cache updated immediately with new avatar:', avatarUrl);
      } else {
        console.warn('⚠️ Could not update auth cache - currentAuthData:', currentAuthData);
      }
      
      // Wait a moment for database to be updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch both the profile query and auth context to get fresh data
      try {
        console.log('Refreshing user data after avatar upload...');
        await Promise.all([
          refetch(), // Refetch profile settings query
          refreshUser(), // Refresh auth context (updates header avatar)
        ]);
        
        console.log('User data refetched successfully');
      } catch (refetchError) {
        console.error('Refetch error:', refetchError);
        // Still try to refresh manually
        try {
          await refreshUser();
        } catch (e) {
          console.error('Manual refresh also failed:', e);
        }
      }
      
      toast.success('Avatar uploaded and updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processAndUploadImage(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processAndUploadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        variables: { input: formData },
      });
      toast.success('Profile updated successfully!');
      // Refetch both queries to update all UI
      await Promise.all([
        refetch(),
        refreshUser(),
      ]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Profile Information
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 700 }}>
        {/* Avatar Upload Section */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Profile Picture
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: { xs: 'center', sm: 'flex-start' } }}>
            {/* Avatar Preview */}
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarPreview || undefined}
                  alt={formData.displayName || 'Avatar'}
                  sx={{
                    width: 160,
                    height: 160,
                    bgcolor: 'primary.main',
                    fontSize: '4rem',
                    border: '4px solid',
                    borderColor: 'divider',
                    boxShadow: 3,
                  }}
                >
                  {!avatarPreview && (formData.displayName || 'U').charAt(0).toUpperCase()}
                </Avatar>
                {isUploading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '50%',
                    }}
                  >
                    <CircularProgress size={40} sx={{ color: 'white' }} />
                  </Box>
                )}
              </Box>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ width: 160 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Uploading...
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {uploadProgress}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 4,
                      bgcolor: 'grey.200',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Upload Controls */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <input
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
              
              {/* Drag and Drop Zone */}
              <Box
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: isDragging ? 'action.hover' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Add sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="body1" fontWeight="medium">
                    {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    JPG, PNG, GIF or WEBP (Max 10MB)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Image will be automatically cropped to a circle and optimized
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="avatar-upload"
                  disabled={isUploading}
                  startIcon={<Add />}
                  sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </Button>
                {avatarPreview && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, avatar: '' }));
                      setAvatarPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={isUploading}
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  >
                    Remove
                  </Button>
                )}
              </Box>

              {/* Size Previews */}
              {avatarPreview && (
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', mb: 1 }}>
                    Preview sizes:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Avatar src={avatarPreview} sx={{ width: 40, height: 40 }} />
                      <Typography variant="caption" color="text.secondary">
                        Small
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Avatar src={avatarPreview} sx={{ width: 64, height: 64 }} />
                      <Typography variant="caption" color="text.secondary">
                        Medium
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Avatar src={avatarPreview} sx={{ width: 120, height: 120 }} />
                      <Typography variant="caption" color="text.secondary">
                        Large
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <TextField
          label="Display Name"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          fullWidth
        />
        <TextField
          label="Bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          multiline
          rows={5}
          fullWidth
          placeholder="Tell us about yourself..."
        />
        <TextField
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          fullWidth
          placeholder="City, Country"
        />
        <TextField
          label="Timezone"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          fullWidth
          placeholder="e.g., UTC-5, EST"
        />
        <TextField
          label="Avatar URL (optional)"
          type="url"
          value={formData.avatar}
          onChange={(e) => {
            setFormData({ ...formData, avatar: e.target.value });
            setAvatarPreview(e.target.value || null);
          }}
          fullWidth
          placeholder="https://example.com/avatar.jpg"
          helperText="Or paste an image URL directly (will override uploaded image)"
          sx={{ mt: 2 }}
        />
        <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
}

// Skills Tab Component
function SkillsTab({ user, skills, addSkill, removeSkill, refetch }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillId: '',
    level: 'INTERMEDIATE',
    yearsOfExperience: '',
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addSkill({
        variables: {
          input: {
            skillId: newSkill.skillId,
            level: newSkill.level,
            yearsOfExperience: newSkill.yearsOfExperience ? parseFloat(newSkill.yearsOfExperience) : null,
          },
        },
      });
      toast.success('Skill added successfully!');
      setShowAddForm(false);
      setNewSkill({ skillId: '', level: 'INTERMEDIATE', yearsOfExperience: '' });
      await refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add skill');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSkill = async (userSkill: any) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    try {
      await removeSkill({ variables: { skillId: userSkill.skill.id } });
      toast.success('Skill removed successfully!');
      await refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove skill');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Skills</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Skill
        </Button>
      </Box>

      {showAddForm && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
          <Box component="form" onSubmit={handleAddSkill} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Skill</InputLabel>
              <Select
                value={newSkill.skillId}
                onChange={(e) => setNewSkill({ ...newSkill, skillId: e.target.value })}
                label="Skill"
                required
              >
                <MenuItem value="">Select a skill</MenuItem>
                {skills.map((skill: any) => (
                  <MenuItem key={skill.id} value={skill.id}>
                    {skill.name} ({skill.category})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                label="Level"
              >
                <MenuItem value="BEGINNER">Beginner</MenuItem>
                <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                <MenuItem value="ADVANCED">Advanced</MenuItem>
                <MenuItem value="EXPERT">Expert</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Years of Experience"
              type="number"
              inputProps={{ step: 0.5, min: 0 }}
              value={newSkill.yearsOfExperience}
              onChange={(e) => setNewSkill({ ...newSkill, yearsOfExperience: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowAddForm(false);
                  setNewSkill({ skillId: '', level: 'INTERMEDIATE', yearsOfExperience: '' });
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {user.skills && user.skills.length > 0 ? (
          user.skills.map((userSkill: any) => (
            <Paper key={userSkill.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {userSkill.skill.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userSkill.level} • {userSkill.skill.category}
                  {userSkill.yearsOfExperience && ` • ${userSkill.yearsOfExperience} years`}
                  {userSkill.isVerified && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Verified"
                      color="success"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </Box>
              <IconButton onClick={() => handleRemoveSkill(userSkill)} color="error">
                <Delete />
              </IconButton>
            </Paper>
          ))
        ) : (
          <Typography color="text.secondary">No skills added yet.</Typography>
        )}
      </Box>
    </Box>
  );
}

// Portfolio Tab Component
function PortfolioTab({ user, refetch }: any) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Portfolio
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Portfolio management coming soon...
      </Typography>
      {user.portfolioItems && user.portfolioItems.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {user.portfolioItems.map((item: any) => (
            <Paper key={item.id} sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {item.description}
              </Typography>
              {item.url && (
                <Button component="a" href={item.url} target="_blank" rel="noopener noreferrer" size="small">
                  View Project →
                </Button>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

// Work History Tab Component
function WorkHistoryTab({ user }: any) {
  const allJobs = [
    ...(user.jobsAsClient || []).map((job: any) => ({ ...job, role: 'Client' })),
    ...(user.jobsAsDeveloper || []).map((job: any) => ({ ...job, role: 'Developer' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Total Jobs
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {user.totalJobs || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Average Rating
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {user.averageRating ? user.averageRating.toFixed(1) : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Completion Rate
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {user.completionRate ? `${user.completionRate.toFixed(1)}%` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Work History
      </Typography>
      {allJobs.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {allJobs.map((job: any) => (
            <Paper key={job.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {job.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    As {job.role} • {job.status} • {job.budget} {job.currency}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {new Date(job.createdAt).toLocaleDateString()}
                    {job.completedAt && ` • Completed: ${new Date(job.completedAt).toLocaleDateString()}`}
                  </Typography>
                </Box>
                <Chip label={job.status} color={getStatusColor(job.status)} size="small" />
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">No work history yet.</Typography>
      )}

      {user.reviewsReceived && user.reviewsReceived.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Reviews Received
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {user.reviewsReceived.map((review: any) => (
              <Paper key={review.id} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    by {review.reviewer.displayName || review.reviewer.username}
                  </Typography>
                </Box>
                {review.comment && <Typography variant="body2">{review.comment}</Typography>}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// Wallet Tab Component
function WalletTab({ user, isConnected, address, isAuthenticating, handleAuthenticate, disconnect }: any) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Wallet Connection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Connect your wallet to enable Web3 features and link it to your account.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ConnectButton />
          {isConnected && address && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Connected: {address}
              </Typography>
              {user.walletAddress && user.walletAddress.toLowerCase() !== address.toLowerCase() && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
                    This wallet is different from your account's linked wallet.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleAuthenticate}
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? 'Authenticating...' : 'Link This Wallet to Account'}
                  </Button>
                </Box>
              )}
              {user.walletAddress && user.walletAddress.toLowerCase() === address.toLowerCase() && (
                <Typography variant="body2" color="success.main">
                  ✓ Wallet is linked to your account
                </Typography>
              )}
              {!user.walletAddress && (
                <Button variant="contained" onClick={handleAuthenticate} disabled={isAuthenticating}>
                  {isAuthenticating ? 'Authenticating...' : 'Link Wallet to Account'}
                </Button>
              )}
            </Box>
          )}
        </Box>

        {isConnected && (
          <Button variant="outlined" color="error" onClick={() => disconnect()} sx={{ alignSelf: 'flex-start' }}>
            Disconnect Wallet
          </Button>
        )}

        {user.walletAddress && (
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Linked Wallet
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {user.walletAddress}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
