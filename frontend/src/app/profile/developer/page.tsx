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
  Star,
  TrendingUp,
  Assignment,
  Send,
} from '@mui/icons-material';
import { LazySection } from '@/components/LazySection';

const GET_DEVELOPER_PROFILE = gql`
  query GetDeveloperProfile {
    me {
      id
      displayName
      username
      avatar
      bio
      location
      role
      averageRating
      totalJobs
      completionRate
      jobsAsDeveloper {
        id
        title
        status
        budget
        currency
        createdAt
        startedAt
        completedAt
        deadline
        client {
          id
          displayName
          username
          avatar
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
      proposals {
        id
        job {
          id
          title
          status
          budget
          currency
        }
        proposedBudget
        status
        createdAt
      }
      reviewsReceived {
        id
        rating
        comment
        reviewer {
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
      portfolioItems {
        id
        title
        description
        url
        images
        tags
      }
    }
  }
`;

type TabType = 'overview' | 'completed' | 'reviews' | 'portfolio';

function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index } = props;
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>;
}

export default function DeveloperProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data, loading, error } = useQuery(GET_DEVELOPER_PROFILE, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/signin');
      } else if (user?.role !== 'DEVELOPER') {
        // Redirect to appropriate profile based on role
        if (user?.role === 'CLIENT') {
          router.push('/profile/client');
        } else {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Show loading or prevent render during auth/role check
  if (authLoading || loading || (isAuthenticated && user?.role !== 'DEVELOPER')) {
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

  if (!isAuthenticated || !data?.me) {
    return null;
  }

  const developer = data.me;
  const displayName = developer.displayName || developer.username || 'Developer';

  // Calculate stats
  const activeJobs = developer.jobsAsDeveloper?.filter((job: any) => 
    ['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW'].includes(job.status)
  ) || [];
  const completedJobs = developer.jobsAsDeveloper?.filter((job: any) => 
    job.status === 'COMPLETED'
  ) || [];
  const pendingProposals = developer.proposals?.filter((p: any) => 
    p.status === 'PENDING'
  ) || [];
  const acceptedProposals = developer.proposals?.filter((p: any) => 
    p.status === 'ACCEPTED'
  ) || [];
  
  const totalEarned = completedJobs.reduce((sum: number, job: any) => sum + (job.budget || 0), 0);
  const inProgressEarnings = activeJobs.reduce((sum: number, job: any) => {
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
                    src={developer.avatar || undefined}
                    sx={{ width: 120, height: 120, border: '4px solid', borderColor: 'primary.main' }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                </Grid>
                <Grid size={{ xs: 12, sm: 'auto' }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {displayName}
                  </Typography>
                  {developer.bio && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {developer.bio}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    {developer.location && (
                      <Chip label={developer.location} size="small" variant="outlined" />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ color: 'warning.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight="600">
                        {developer.averageRating?.toFixed(1) || '0.0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({developer.reviewsReceived?.length || 0} reviews)
                      </Typography>
                    </Box>
                    <Chip
                      label={`${developer.completionRate || 0}% Completion Rate`}
                      color="success"
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button variant="contained" onClick={() => router.push('/developer')}>
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
                        Total Earned
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ${totalEarned.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Reviews Received
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {developer.reviewsReceived?.length || 0}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Active Contracts
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
                    onClick={() => router.push('/developer')}
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
              <Tab label={`Reviews (${developer.reviewsReceived?.length || 0})`} value="reviews" />
              <Tab label={`Portfolio (${developer.portfolioItems?.length || 0})`} value="portfolio" />
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
                      {developer.bio ? (
                        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {developer.bio}
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
                        onClick={() => router.push('/developer')}
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
                                  {job.client && (
                                    <Chip
                                      label={`Client: ${job.client.displayName || job.client.username}`}
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
                      Recent Reviews
                    </Typography>
                    {developer.reviewsReceived && developer.reviewsReceived.length > 0 && (
                      <Button size="small" onClick={() => setActiveTab('reviews')}>
                        View All
                      </Button>
                    )}
                  </Box>
                  {developer.reviewsReceived && developer.reviewsReceived.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {developer.reviewsReceived.slice(0, 3).map((review: any) => (
                        <Card key={review.id} variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Avatar src={review.reviewer?.avatar} sx={{ width: 48, height: 48 }}>
                                {review.reviewer?.displayName?.charAt(0) || 'R'}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography variant="subtitle2" fontWeight="600">
                                    {review.reviewer?.displayName || review.reviewer?.username || 'Anonymous'}
                                  </Typography>
                                  <Rating value={review.rating} readOnly size="small" />
                                </Box>
                                {review.comment && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {review.comment}
                                  </Typography>
                                )}
                                {review.job && (
                                  <Typography variant="caption" color="text.secondary">
                                    For: {review.job.title}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">No reviews yet</Typography>
                    </Paper>
                  )}
                </Grid>

                {/* Portfolio Preview */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Portfolio
                    </Typography>
                    {developer.portfolioItems && developer.portfolioItems.length > 0 && (
                      <Button size="small" onClick={() => setActiveTab('portfolio')}>
                        View All
                      </Button>
                    )}
                  </Box>
                  {!developer.portfolioItems || developer.portfolioItems.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Portfolio Items Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Showcase your work by adding portfolio items
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => router.push('/profile/settings')}
                        startIcon={<Assignment />}
                      >
                        Add Portfolio Item
                      </Button>
                    </Paper>
                  ) : (
                    <Grid container spacing={2}>
                      {developer.portfolioItems.slice(0, 3).map((item: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                          <Card>
                            {item.images && item.images.length > 0 && (
                              <Box
                                sx={{
                                  height: 200,
                                  backgroundImage: `url(${item.images[0]})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                            )}
                            <CardContent>
                              <Typography variant="h6" fontWeight="600" gutterBottom>
                                {item.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {item.description}
                              </Typography>
                              {item.url && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Project
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Completed Jobs Tab */}
            <TabPanel value={activeTab === 'completed' ? 1 : -1} index={1}>
              {completedJobs.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No completed jobs</Typography>
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
              {!developer.reviewsReceived || developer.reviewsReceived.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No reviews received</Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {developer.reviewsReceived.map((review: any) => (
                    <Card key={review.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Avatar src={review.reviewer?.avatar} sx={{ width: 56, height: 56 }}>
                            {review.reviewer?.displayName?.charAt(0) || 'R'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600">
                                {review.reviewer?.displayName || review.reviewer?.username || 'Anonymous'}
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

            {/* Portfolio Tab */}
            <TabPanel value={activeTab === 'portfolio' ? 3 : -1} index={3}>
              {!developer.portfolioItems || developer.portfolioItems.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No portfolio items</Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => router.push('/profile/settings')}
                  >
                    Add Portfolio Item
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {developer.portfolioItems.map((item: any) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                      <Card>
                        {item.images && item.images.length > 0 && (
                          <Box
                            sx={{
                              height: 200,
                              backgroundImage: `url(${item.images[0]})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                        )}
                        <CardContent>
                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.description}
                          </Typography>
                          {item.url && (
                            <Button
                              variant="outlined"
                              size="small"
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Project
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}


