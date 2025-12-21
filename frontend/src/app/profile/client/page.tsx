'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Divider,
  Paper,
  Rating,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Work,
  CheckCircle,
  Schedule,
  AttachMoney,
  People,
  TrendingUp,
  Assignment,
  Send,
  Star,
} from '@mui/icons-material';
import { LazySection } from '@/components/LazySection';

const GET_CLIENT_PROFILE = gql`
  query GetClientProfile {
    me {
      id
      displayName
      username
      avatar
      bio
      location
      role
      jobsAsClient {
        id
        title
        status
        budget
        currency
        createdAt
        startedAt
        completedAt
        deadline
        developer {
          id
          displayName
          username
          avatar
          averageRating
        }
        proposals {
          id
          developer {
            id
            displayName
            username
            avatar
            averageRating
          }
          proposedBudget
          status
          createdAt
        }
        milestones {
          id
          title
          status
          amount
          dueDate
          completedAt
        }
      }
      reviewsGiven {
        id
        rating
        comment
        reviewee {
          displayName
          username
          avatar
        }
        createdAt
        job {
          id
          title
        }
      }
    }
  }
`;

type TabType = 'overview' | 'completed' | 'reviews';

function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index } = props;
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>;
}

export default function ClientProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data, loading, error } = useQuery(GET_CLIENT_PROFILE, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/signin');
      } else if (user?.role !== 'CLIENT') {
        // Redirect to appropriate dashboard based on role
        if (user?.role === 'DEVELOPER') {
          router.push('/profile/developer');
        } else {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Show loading or prevent render during auth/role check
  if (authLoading || loading || (isAuthenticated && user?.role !== 'CLIENT')) {
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
        <Container maxWidth="lg">
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h5" color="error" gutterBottom>
                Error Loading Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {error.message || 'Failed to load your profile data'}
              </Typography>
              <Button variant="contained" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Use user from auth context as fallback if GraphQL data is not available
  const client = data?.me || {
    id: user?.id,
    displayName: user?.displayName,
    username: user?.username,
    avatar: user?.avatar,
    bio: null,
    location: null,
    role: user?.role,
    jobsAsClient: [],
    reviewsGiven: [],
  };

  const displayName = client.displayName || client.username || user?.email?.split('@')[0] || 'Client';

  // Calculate stats
  const activeJobs = client.jobsAsClient?.filter((job: any) => 
    ['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW'].includes(job.status)
  ) || [];
  const completedJobs = client.jobsAsClient?.filter((job: any) => 
    job.status === 'COMPLETED'
  ) || [];
  
  // Get all proposals from active jobs
  const allProposals = activeJobs.flatMap((job: any) => job.proposals || []);
  const pendingProposals = allProposals.filter((p: any) => p.status === 'PENDING');
  const acceptedProposals = allProposals.filter((p: any) => p.status === 'ACCEPTED');
  
  // Get hired freelancers (developers assigned to jobs)
  const hiredFreelancers = [
    ...new Map(
      activeJobs
        .concat(completedJobs)
        .filter((job: any) => job.developer)
        .map((job: any) => [job.developer.id, job.developer])
    ).values()
  ];

  const totalSpent = completedJobs.reduce((sum: number, job: any) => sum + (job.budget || 0), 0);
  const activeSpending = activeJobs.reduce((sum: number, job: any) => {
    const completedMilestones = job.milestones?.filter((m: any) => m.status === 'completed') || [];
    return sum + completedMilestones.reduce((s: number, m: any) => s + (m.amount || 0), 0);
  }, 0);

  // Calculate job progress
  const getJobProgress = (job: any) => {
    if (!job.milestones || job.milestones.length === 0) return 0;
    const completed = job.milestones.filter((m: any) => m.status === 'completed').length;
    return Math.round((completed / job.milestones.length) * 100);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <LazySection>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid>
                  <Avatar
                    src={client.avatar || undefined}
                    sx={{ width: 120, height: 120, border: '4px solid', borderColor: 'success.main' }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                </Grid>
                <Grid size={{ xs: 12, sm: 'auto' }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {displayName}
                  </Typography>
                  {client.bio ? (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {client.bio}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                      No bio added yet. Add one in your profile settings.
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    {client.location && (
                      <Chip label={client.location} size="small" variant="outlined" />
                    )}
                    <Chip 
                      label={client.role === 'CLIENT' ? 'Client' : client.role || 'User'} 
                      color="success" 
                      size="small" 
                    />
                    {user?.email && (
                      <Chip label={user.email} size="small" variant="outlined" />
                    )}
                  </Box>
                </Grid>
                <Grid>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button variant="contained" onClick={() => router.push('/client')}>
                      Go to Dashboard
                    </Button>
                    <Button variant="outlined" onClick={() => router.push('/profile/settings')}>
                      Edit Profile
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </LazySection>

        {/* Quick Stats & Navigation */}
        <LazySection>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Profile Overview
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Completed Jobs
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {completedJobs.length}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Spent
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ${totalSpent.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Reviews Given
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {client.reviewsGiven?.length || 0}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Active Jobs
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {activeJobs.length}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => router.push('/client')}
                    startIcon={<Work />}
                    sx={{ mb: 1 }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => router.push('/profile/settings')}
                  >
                    Edit Profile Settings
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </LazySection>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" value="overview" />
              <Tab label={`Completed Jobs (${completedJobs.length})`} value="completed" />
              <Tab label={`Reviews Given (${client.reviewsGiven?.length || 0})`} value="reviews" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Overview Tab */}
            <TabPanel value={activeTab === 'overview' ? 0 : -1} index={0}>
              <Grid container spacing={3}>
                {/* Profile Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    About
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      {client.bio ? (
                        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {client.bio}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No bio added yet. Add one in your profile settings.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recent Completed Jobs */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Recent Completed Jobs
                    </Typography>
                    {completedJobs.length > 0 && (
                      <Button size="small" onClick={() => setActiveTab('completed')}>
                        View All
                      </Button>
                    )}
                  </Box>
                  {completedJobs.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <CheckCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Completed Jobs Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Completed projects will appear here once jobs are finished
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => router.push('/client')}
                        startIcon={<Work />}
                      >
                        Go to Dashboard
                      </Button>
                    </Paper>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {completedJobs.slice(0, 3).map((job: any) => (
                        <Card key={job.id} variant="outlined">
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid size={{ xs: 12, md: 8 }}>
                                <Typography variant="h6" fontWeight="600" gutterBottom>
                                  {job.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                  <Chip label="Completed" size="small" color="success" />
                                  <Chip
                                    label={`${job.budget} ${job.currency}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                  {job.developer && (
                                    <Chip
                                      label={`Freelancer: ${job.developer.displayName || job.developer.username}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                                {job.completedAt && (
                                  <Typography variant="body2" color="text.secondary">
                                    Completed on {new Date(job.completedAt).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Grid>
                              <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                <Button
                                  variant="outlined"
                                  onClick={() => router.push(`/jobs/${job.id}`)}
                                >
                                  View Details
                                </Button>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Grid>

                {/* Recent Reviews */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Recent Reviews Given
                    </Typography>
                    {client.reviewsGiven && client.reviewsGiven.length > 0 && (
                      <Button size="small" onClick={() => setActiveTab('reviews')}>
                        View All
                      </Button>
                    )}
                  </Box>
                  {!client.reviewsGiven || client.reviewsGiven.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Star sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Reviews Given Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Leave reviews for freelancers after completing jobs
                      </Typography>
                    </Paper>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {client.reviewsGiven.slice(0, 3).map((review: any) => (
                        <Card key={review.id} variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Avatar src={review.reviewee?.avatar} sx={{ width: 56, height: 56 }}>
                                {review.reviewee?.displayName?.charAt(0) || 'F'}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="600">
                                    {review.reviewee?.displayName || review.reviewee?.username || 'Freelancer'}
                                  </Typography>
                                  <Rating value={review.rating} readOnly />
                                </Box>
                                {review.comment && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {review.comment}
                                  </Typography>
                                )}
                                {review.job && (
                                  <Typography variant="caption" color="text.secondary">
                                    For: {review.job.title} • {new Date(review.createdAt).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Completed Jobs Tab */}
            <TabPanel value={activeTab === 'completed' ? 1 : -1} index={1}>
              {completedJobs.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Completed Jobs Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed projects will appear here once jobs are finished
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {completedJobs.map((job: any) => (
                    <Card key={job.id} variant="outlined">
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, md: 8 }}>
                            <Typography variant="h6" fontWeight="600" gutterBottom>
                              {job.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <Chip label="Completed" size="small" color="success" />
                              <Chip
                                label={`${job.budget} ${job.currency}`}
                                size="small"
                                variant="outlined"
                              />
                              {job.developer && (
                                <Chip
                                  label={`Freelancer: ${job.developer.displayName || job.developer.username}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            {job.completedAt && (
                              <Typography variant="body2" color="text.secondary">
                                Completed on {new Date(job.completedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Button
                              variant="outlined"
                              onClick={() => router.push(`/jobs/${job.id}`)}
                            >
                              View Details
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </TabPanel>


            {/* Reviews Tab */}
            <TabPanel value={activeTab === 'reviews' ? 2 : -1} index={2}>
              {!client.reviewsGiven || client.reviewsGiven.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Star sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Reviews Given Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Leave reviews for freelancers after completing jobs
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {client.reviewsGiven.map((review: any) => (
                    <Card key={review.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Avatar src={review.reviewee?.avatar} sx={{ width: 56, height: 56 }}>
                            {review.reviewee?.displayName?.charAt(0) || 'F'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600">
                                {review.reviewee?.displayName || review.reviewee?.username || 'Freelancer'}
                              </Typography>
                              <Rating value={review.rating} readOnly />
                            </Box>
                            {review.comment && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {review.comment}
                              </Typography>
                            )}
                            {review.job && (
                              <Typography variant="caption" color="text.secondary">
                                For: {review.job.title} • {new Date(review.createdAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </TabPanel>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

