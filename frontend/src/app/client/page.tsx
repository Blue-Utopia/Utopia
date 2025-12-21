'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Divider,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Work,
  People,
  AttachMoney,
  TrendingUp,
  CheckCircle,
  Schedule,
  Message,
  MoreVert,
  Star,
  ArrowForward,
  Assignment,
  PersonAdd,
  Person,
} from '@mui/icons-material';
import { LazySection } from '@/components/LazySection';

type TabType = 'overview' | 'jobs' | 'proposals' | 'freelancers' | 'messages';

export default function ClientPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Role-based access control
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/signin');
      } else if (user?.role !== 'CLIENT') {
        // Redirect to appropriate dashboard based on role
        if (user?.role === 'DEVELOPER') {
          router.push('/developer');
        } else {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Show loading or prevent render during auth check
  if (authLoading || (isAuthenticated && user?.role !== 'CLIENT')) {
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

  // Mock data - will be replaced with GraphQL queries
  const stats = {
    activeJobs: 3,
    proposalsReceived: 24,
    hiredFreelancers: 2,
    totalSpent: 12500,
  };

  const activeJobs = [
    {
      id: '1',
      title: 'Full Stack Developer Needed for DeFi Project',
      status: 'OPEN',
      budget: 5000,
      currency: 'USDC',
      proposalCount: 8,
      views: 156,
      createdAt: '2 days ago',
    },
    {
      id: '2',
      title: 'Smart Contract Audit Required',
      status: 'OPEN',
      budget: 3000,
      currency: 'USDT',
      proposalCount: 5,
      views: 89,
      createdAt: '5 days ago',
    },
    {
      id: '3',
      title: 'UI/UX Designer for Web3 App',
      status: 'IN_PROGRESS',
      budget: 2500,
      currency: 'ETH',
      proposalCount: 12,
      views: 203,
      createdAt: '1 week ago',
      hiredFreelancer: {
        name: 'Sarah Johnson',
        avatar: '',
        rating: 4.9,
      },
    },
  ];

  const recentProposals = [
    {
      id: '1',
      jobId: '1',
      jobTitle: 'Full Stack Developer Needed for DeFi Project',
      freelancer: {
        name: 'John Doe',
        avatar: '',
        rating: 4.8,
        completedJobs: 45,
        location: 'United States',
      },
      bid: 4800,
      currency: 'USDC',
      deliveryTime: '30 days',
      coverLetter: 'I have extensive experience building DeFi applications...',
      submittedAt: '2 hours ago',
      status: 'PENDING',
    },
    {
      id: '2',
      jobId: '1',
      jobTitle: 'Full Stack Developer Needed for DeFi Project',
      freelancer: {
        name: 'Jane Smith',
        avatar: '',
        rating: 4.9,
        completedJobs: 67,
        location: 'Canada',
      },
      bid: 5200,
      currency: 'USDC',
      deliveryTime: '25 days',
      coverLetter: 'I specialize in blockchain development and have worked on multiple DeFi projects...',
      submittedAt: '5 hours ago',
      status: 'PENDING',
    },
  ];

  const hiredFreelancers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '',
      rating: 4.9,
      jobTitle: 'UI/UX Designer for Web3 App',
      status: 'IN_PROGRESS',
      progress: 65,
      budget: 2500,
      currency: 'ETH',
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: '',
      rating: 4.7,
      jobTitle: 'Backend API Development',
      status: 'COMPLETED',
      progress: 100,
      budget: 3500,
      currency: 'USDC',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Client Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your jobs, proposals, and freelancers
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Person />}
              onClick={() => router.push('/profile/client')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              My Profile
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => router.push('/post-job')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Post a Job
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
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
                      {stats.activeJobs}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                    +2 this month
                  </Typography>
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
                      {stats.proposalsReceived}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                    +8 new today
                  </Typography>
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
                      {stats.hiredFreelancers}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {stats.hiredFreelancers} active contracts
                  </Typography>
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
                      ${stats.totalSpent.toLocaleString()}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                    +$2,500 this month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" value="overview" />
              <Tab label={`Jobs (${activeJobs.length})`} value="jobs" />
              <Tab label={`Proposals (${recentProposals.length})`} value="proposals" />
              <Tab label={`Freelancers (${hiredFreelancers.length})`} value="freelancers" />
              <Tab label="Messages" value="messages" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {activeTab === 'overview' && (
              <LazySection minHeight={400}>
                <OverviewTab
                  activeJobs={activeJobs}
                  recentProposals={recentProposals}
                  hiredFreelancers={hiredFreelancers}
                  router={router}
                />
              </LazySection>
            )}

            {activeTab === 'jobs' && (
              <LazySection minHeight={400}>
                <JobsTab jobs={activeJobs} router={router} />
              </LazySection>
            )}

            {activeTab === 'proposals' && (
              <LazySection minHeight={400}>
                <ProposalsTab proposals={recentProposals} router={router} />
              </LazySection>
            )}

            {activeTab === 'freelancers' && (
              <LazySection minHeight={400}>
                <FreelancersTab freelancers={hiredFreelancers} router={router} />
              </LazySection>
            )}

            {activeTab === 'messages' && (
              <LazySection minHeight={400}>
                <MessagesTab />
              </LazySection>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// Overview Tab Component
function OverviewTab({ activeJobs, recentProposals, hiredFreelancers, router }: any) {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Active Jobs */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Active Jobs
            </Typography>
            <Button size="small" onClick={() => router.push('/client?tab=jobs')}>
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
                        {job.proposalCount} proposals
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.views} views
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ${job.budget.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Recent Proposals */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Proposals
            </Typography>
            <Button size="small" onClick={() => router.push('/client?tab=proposals')}>
              View All
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentProposals.slice(0, 3).map((proposal: any) => (
              <Paper key={proposal.id} sx={{ p: 2, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <Avatar>{proposal.freelancer.name.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="600">
                      {proposal.freelancer.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                      <Typography variant="caption">{proposal.freelancer.rating}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {proposal.freelancer.completedJobs} jobs
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {proposal.jobTitle}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ${proposal.bid.toLocaleString()}
                  </Typography>
                  <Chip label={proposal.status} size="small" color="info" />
                </Box>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Hired Freelancers */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Active Contracts
            </Typography>
            <Button size="small" onClick={() => router.push('/client?tab=freelancers')}>
              View All
            </Button>
          </Box>
          <Grid container spacing={2}>
            {hiredFreelancers.map((freelancer: any) => (
              <Grid size={{ xs: 12, md: 6 }} key={freelancer.id}>
                <Paper sx={{ p: 3, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56 }}>{freelancer.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {freelancer.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                        <Typography variant="body2">{freelancer.rating}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {freelancer.jobTitle}
                      </Typography>
                    </Box>
                  </Box>
                  {freelancer.status === 'IN_PROGRESS' && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight="600">
                          {freelancer.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={freelancer.progress} sx={{ height: 8, borderRadius: 1 }} />
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ${freelancer.budget.toLocaleString()}
                    </Typography>
                    <Chip
                      label={freelancer.status}
                      size="small"
                      color={freelancer.status === 'COMPLETED' ? 'success' : 'primary'}
                      icon={freelancer.status === 'COMPLETED' ? <CheckCircle /> : <Schedule />}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

// Jobs Tab Component
function JobsTab({ jobs, router }: any) {
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
                    {job.proposalCount} proposals
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {job.views} views
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posted {job.createdAt}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right', ml: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  ${job.budget.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {job.currency}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" size="small">
                View Details
              </Button>
              <Button variant="outlined" size="small" startIcon={<Message />}>
                View Proposals ({job.proposalCount})
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

// Proposals Tab Component
function ProposalsTab({ proposals, router }: any) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Proposals Received
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {proposals.map((proposal: any) => (
          <Paper key={proposal.id} sx={{ p: 3, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56 }}>{proposal.freelancer.name.charAt(0)}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      {proposal.freelancer.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="body2" fontWeight="600">
                          {proposal.freelancer.rating}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {proposal.freelancer.completedJobs} jobs completed
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {proposal.freelancer.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label={proposal.status} size="small" color="info" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  For: <strong>{proposal.jobTitle}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {proposal.coverLetter}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ${proposal.bid.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Delivery in {proposal.deliveryTime}
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
      </Box>
    </Box>
  );
}

// Freelancers Tab Component
function FreelancersTab({ freelancers, router }: any) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Hired Freelancers
      </Typography>
      <Grid container spacing={3}>
        {freelancers.map((freelancer: any) => (
          <Grid size={{ xs: 12, md: 6 }} key={freelancer.id}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%', '&:hover': { boxShadow: 4 } }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64 }}>{freelancer.name.charAt(0)}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="600">
                    {freelancer.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="body2" fontWeight="600">
                      {freelancer.rating}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {freelancer.jobTitle}
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              {freelancer.status === 'IN_PROGRESS' && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="caption" fontWeight="600">
                      {freelancer.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={freelancer.progress} sx={{ height: 8, borderRadius: 1 }} />
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ${freelancer.budget.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {freelancer.currency}
                  </Typography>
                </Box>
                <Chip
                  label={freelancer.status}
                  size="small"
                  color={freelancer.status === 'COMPLETED' ? 'success' : 'primary'}
                  icon={freelancer.status === 'COMPLETED' ? <CheckCircle /> : <Schedule />}
                />
              </Box>
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
      </Grid>
    </Box>
  );
}

// Messages Tab Component
function MessagesTab() {
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
