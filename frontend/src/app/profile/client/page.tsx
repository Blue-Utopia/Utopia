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
  IconButton,
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
  Add,
  Message,
  MoreVert,
  PersonAdd,
  Person,
  ArrowForward,
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

type TabType = 'dashboard-overview' | 'dashboard-jobs' | 'dashboard-proposals' | 'dashboard-freelancers' | 'dashboard-messages' | 'profile-overview' | 'profile-completed' | 'profile-reviews' | 'profile-settings';

function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index } = props;
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>;
}

export default function ClientProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard-overview');
  const [activeSection, setActiveSection] = useState<'dashboard' | 'profile'>('dashboard');

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
                    <Button variant="contained" startIcon={<Work />} onClick={() => router.push('/post-job')}>
                      Post a Job
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

        {/* Dashboard Stats Cards */}
        <LazySection>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(0,0,0,0.06)',
                  height: '100%',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                          mb: 1.5,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Active Jobs
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          lineHeight: 1.2,
                          mb: 0.5,
                        }}
                      >
                        {activeJobs.length}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        borderRadius: 2.5,
                        p: 1.5,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 56,
                        height: 56,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      }}
                    >
                      <Work sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(0,0,0,0.06)',
                  height: '100%',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                          mb: 1.5,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Proposals Received
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          lineHeight: 1.2,
                          mb: 0.5,
                        }}
                      >
                        {allProposals.length}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: 'success.main',
                        borderRadius: 2.5,
                        p: 1.5,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 56,
                        height: 56,
                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                      }}
                    >
                      <Assignment sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(0,0,0,0.06)',
                  height: '100%',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                          mb: 1.5,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Hired Freelancers
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          lineHeight: 1.2,
                          mb: 0.5,
                        }}
                      >
                        {hiredFreelancers.length}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: 'info.main',
                        borderRadius: 2.5,
                        p: 1.5,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 56,
                        height: 56,
                        boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)',
                      }}
                    >
                      <People sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(0,0,0,0.06)',
                  height: '100%',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                          mb: 1.5,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Total Spent
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          lineHeight: 1.2,
                          mb: 0.5,
                        }}
                      >
                        ${totalSpent.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: 'warning.main',
                        borderRadius: 2.5,
                        p: 1.5,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 56,
                        height: 56,
                        boxShadow: '0 4px 12px rgba(237, 108, 2, 0.3)',
                      }}
                    >
                      <AttachMoney sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </LazySection>

        {/* Section Toggle */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button
            variant={activeSection === 'dashboard' ? 'contained' : 'outlined'}
            onClick={() => {
              setActiveSection('dashboard');
              setActiveTab('dashboard-overview');
            }}
          >
            Dashboard
          </Button>
          <Button
            variant={activeSection === 'profile' ? 'contained' : 'outlined'}
            onClick={() => {
              setActiveSection('profile');
              setActiveTab('profile-overview');
            }}
          >
            Profile
          </Button>
        </Box>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue as TabType)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {activeSection === 'dashboard' ? (
                <>
                  <Tab label="Overview" value="dashboard-overview" />
                  <Tab label={`Jobs (${activeJobs.length})`} value="dashboard-jobs" />
                  <Tab label={`Proposals (${allProposals.length})`} value="dashboard-proposals" />
                  <Tab label={`Freelancers (${hiredFreelancers.length})`} value="dashboard-freelancers" />
                  <Tab label="Messages" value="dashboard-messages" />
                </>
              ) : (
                <>
                  <Tab label="Overview" value="profile-overview" />
                  <Tab label={`Completed Jobs (${completedJobs.length})`} value="profile-completed" />
                  <Tab label={`Reviews Given (${client.reviewsGiven?.length || 0})`} value="profile-reviews" />
                  <Tab label="Settings" value="profile-settings" />
                </>
              )}
            </Tabs>
          </Box>

          <CardContent>
            {/* Dashboard Tabs */}
            {activeSection === 'dashboard' && (
              <>
                <TabPanel value={activeTab === 'dashboard-overview' ? 0 : -1} index={0}>
                  <DashboardOverviewTab
                    activeJobs={activeJobs}
                    allProposals={allProposals}
                    hiredFreelancers={hiredFreelancers}
                    router={router}
                  />
                </TabPanel>
                <TabPanel value={activeTab === 'dashboard-jobs' ? 1 : -1} index={1}>
                  <DashboardJobsTab jobs={activeJobs} router={router} />
                </TabPanel>
                <TabPanel value={activeTab === 'dashboard-proposals' ? 2 : -1} index={2}>
                  <DashboardProposalsTab proposals={allProposals} router={router} />
                </TabPanel>
                <TabPanel value={activeTab === 'dashboard-freelancers' ? 3 : -1} index={3}>
                  <DashboardFreelancersTab freelancers={hiredFreelancers} router={router} />
                </TabPanel>
                <TabPanel value={activeTab === 'dashboard-messages' ? 4 : -1} index={4}>
                  <DashboardMessagesTab />
                </TabPanel>
              </>
            )}

            {/* Profile Tabs */}
            {activeSection === 'profile' && (
              <>
                <TabPanel value={activeTab === 'profile-overview' ? 0 : -1} index={0}>
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
                      <Button size="small" onClick={() => setActiveTab('profile-completed')}>
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
                        onClick={() => {
                          setActiveSection('dashboard');
                          setActiveTab('dashboard-overview');
                        }}
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
                      <Button size="small" onClick={() => setActiveTab('profile-reviews')}>
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

                <TabPanel value={activeTab === 'profile-completed' ? 1 : -1} index={1}>
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


                <TabPanel value={activeTab === 'profile-reviews' ? 2 : -1} index={2}>
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
                <TabPanel value={activeTab === 'profile-settings' ? 3 : -1} index={3}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Button variant="contained" onClick={() => router.push('/profile/settings')}>
                      Go to Profile Settings
                    </Button>
                  </Box>
                </TabPanel>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// Dashboard Tab Components
function DashboardOverviewTab({ activeJobs, allProposals, hiredFreelancers, router }: any) {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Active Jobs
            </Typography>
            <Button size="small" onClick={() => router.push('/profile/client?section=dashboard&tab=dashboard-jobs')}>
              View All
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeJobs.slice(0, 3).map((job: any) => (
              <Paper key={job.id} sx={{ p: 2, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      {job.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip
                        label={job.status}
                        size="small"
                        color={job.status === 'OPEN' ? 'success' : 'primary'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {job.proposals?.length || 0} proposals
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ${job.budget?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Paper>
            ))}
            {activeJobs.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Active Jobs
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/post-job')} sx={{ mt: 2 }}>
                  Post a Job
                </Button>
              </Paper>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Proposals
            </Typography>
            <Button size="small" onClick={() => router.push('/profile/client?section=dashboard&tab=dashboard-proposals')}>
              View All
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {allProposals.slice(0, 3).map((proposal: any) => (
              <Paper key={proposal.id} sx={{ p: 2, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <Avatar>{proposal.developer?.displayName?.charAt(0) || 'F'}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="600">
                      {proposal.developer?.displayName || proposal.developer?.username || 'Freelancer'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {proposal.developer?.averageRating && (
                        <>
                          <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                          <Typography variant="caption">{proposal.developer.averageRating.toFixed(1)}</Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ${proposal.proposedBudget?.toLocaleString() || 0}
                  </Typography>
                  <Chip label={proposal.status} size="small" color="info" />
                </Box>
              </Paper>
            ))}
            {allProposals.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Proposals Yet
                </Typography>
              </Paper>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Active Contracts
            </Typography>
            <Button size="small" onClick={() => router.push('/profile/client?section=dashboard&tab=dashboard-freelancers')}>
              View All
            </Button>
          </Box>
          <Grid container spacing={2}>
            {hiredFreelancers.slice(0, 4).map((freelancer: any, idx: number) => (
              <Grid size={{ xs: 12, md: 6 }} key={freelancer.id || idx}>
                <Paper sx={{ p: 3, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56 }}>{freelancer.displayName?.charAt(0) || 'F'}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {freelancer.displayName || freelancer.username || 'Freelancer'}
                      </Typography>
                      {freelancer.averageRating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                          <Typography variant="body2">{freelancer.averageRating.toFixed(1)}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
            {hiredFreelancers.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Hired Freelancers Yet
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

function DashboardJobsTab({ jobs, router }: any) {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Your Jobs
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/post-job')}>
          Post a Job
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {jobs.map((job: any) => (
          <Paper key={job.id} sx={{ p: 3, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {job.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip
                    label={job.status}
                    size="small"
                    color={job.status === 'OPEN' ? 'success' : 'primary'}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {job.proposals?.length || 0} proposals
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right', ml: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  ${job.budget?.toLocaleString() || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {job.currency || 'USDC'}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" size="small" onClick={() => router.push(`/jobs/${job.id}`)}>
                View Details
              </Button>
              <Button variant="outlined" size="small" startIcon={<Message />}>
                View Proposals ({job.proposals?.length || 0})
              </Button>
            </Box>
          </Paper>
        ))}
        {jobs.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Work sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              No Jobs Posted Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start posting jobs to find talented freelancers.
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/post-job')}>
              Post Your First Job
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

function DashboardProposalsTab({ proposals, router }: any) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Proposals Received
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {proposals.map((proposal: any) => (
          <Paper key={proposal.id} sx={{ p: 3, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56 }}>{proposal.developer?.displayName?.charAt(0) || 'F'}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      {proposal.developer?.displayName || proposal.developer?.username || 'Freelancer'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {proposal.developer?.averageRating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="body2" fontWeight="600">
                            {proposal.developer.averageRating.toFixed(1)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Chip label={proposal.status} size="small" color="info" />
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ${proposal.proposedBudget?.toLocaleString() || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small">
                  View Profile
                </Button>
                <Button variant="outlined" size="small" startIcon={<Message />}>
                  Message
                </Button>
                <Button variant="contained" size="small" startIcon={<PersonAdd />}>
                  Hire
                </Button>
              </Box>
            </Box>
          </Paper>
        ))}
        {proposals.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              No Proposals Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Proposals from freelancers will appear here once you post jobs.
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/post-job')}>
              Post a Job
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

function DashboardFreelancersTab({ freelancers, router }: any) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Hired Freelancers
      </Typography>
      <Grid container spacing={3}>
        {freelancers.map((freelancer: any, idx: number) => (
          <Grid size={{ xs: 12, md: 6 }} key={freelancer.id || idx}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%', '&:hover': { boxShadow: 4 } }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64 }}>{freelancer.displayName?.charAt(0) || 'F'}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="600">
                    {freelancer.displayName || freelancer.username || 'Freelancer'}
                  </Typography>
                  {freelancer.averageRating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="body2" fontWeight="600">
                        {freelancer.averageRating.toFixed(1)}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" fullWidth startIcon={<Message />}>
                  Message
                </Button>
                <Button variant="outlined" size="small" fullWidth>
                  View Details
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
        {freelancers.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <People sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                No Hired Freelancers Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Hire freelancers by accepting their proposals on your jobs.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/post-job')}>
                Post a Job
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

function DashboardMessagesTab() {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Message sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        No Messages Yet
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Start a conversation with your freelancers or respond to proposals.
      </Typography>
    </Box>
  );
}

