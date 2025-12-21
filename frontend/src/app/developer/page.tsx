'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
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
  Work,
  Assignment,
  AttachMoney,
  TrendingUp,
  CheckCircle,
  Schedule,
  Message,
  MoreVert,
  Star,
  Search,
  Send,
  Visibility,
  Person,
} from '@mui/icons-material';
import { LazySection } from '@/components/LazySection';

const GET_DEVELOPER_DASHBOARD = gql`
  query GetDeveloperDashboard {
    me {
      id
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
        proposedDuration
        job {
          id
          title
          status
          budget
          currency
          client {
            displayName
            username
            avatar
          }
        }
        proposedBudget
        status
        createdAt
      }
    }
    jobs(filters: { status: OPEN }, limit: 10) {
      jobs {
        id
        title
        description
        category
        budget
        currency
        status
        createdAt
        proposalCount
        client {
          id
          displayName
          username
          avatar
        }
        requiredSkills {
          skill {
            name
          }
        }
      }
      totalCount
    }
  }
`;

type TabType = 'overview' | 'jobs' | 'proposals' | 'contracts' | 'messages';

export default function DeveloperPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data, loading, error } = useQuery(GET_DEVELOPER_DASHBOARD, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/signin');
      } else if (user?.role !== 'DEVELOPER') {
        // Redirect to appropriate dashboard based on role
        if (user?.role === 'CLIENT') {
          router.push('/client');
        } else {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
        <Container maxWidth="xl">
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h5" color="error" gutterBottom>
                Error Loading Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {error.message || 'Failed to load dashboard data'}
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

  const developer = data?.me || {
    jobsAsDeveloper: [],
    proposals: [],
  };

  const availableJobs = data?.jobs?.jobs || [];

  // Calculate stats from real data
  const activeContracts = developer.jobsAsDeveloper?.filter((job: any) =>
    ['IN_PROGRESS', 'UNDER_REVIEW'].includes(job.status)
  ) || [];
  const completedJobs = developer.jobsAsDeveloper?.filter((job: any) =>
    job.status === 'COMPLETED'
  ) || [];
  const totalEarned = completedJobs.reduce((sum: number, job: any) => sum + (job.budget || 0), 0);

  const stats = {
    activeContracts: activeContracts.length,
    proposalsSent: developer.proposals?.length || 0,
    jobsCompleted: completedJobs.length,
    totalEarned,
  };

  // Transform proposals data
  const myProposals = developer.proposals?.map((proposal: any) => ({
    id: proposal.id,
    jobId: proposal.job?.id,
    jobTitle: proposal.job?.title || 'Job',
    bid: proposal.proposedBudget,
    currency: proposal.job?.currency || 'USDC',
    status: proposal.status,
    submittedAt: proposal.createdAt,
    proposedDuration: proposal.proposedDuration,
    job: proposal.job,
  })) || [];

  // Transform active contracts data
  const transformedActiveContracts = activeContracts.map((contract: any) => {
    const completedMilestones = contract.milestones?.filter((m: any) => m.status === 'completed') || [];
    const totalMilestones = contract.milestones?.length || 0;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones.length / totalMilestones) * 100) : 0;

    return {
      id: contract.id,
      title: contract.title,
      client: {
        name: contract.client?.displayName || contract.client?.username || 'Client',
        avatar: contract.client?.avatar,
      },
      status: contract.status,
      progress,
      budget: contract.budget,
      currency: contract.currency,
      startedAt: contract.startedAt,
      deadline: contract.deadline,
      milestones: contract.milestones,
    };
  });

  // Calculate job progress helper
  const getJobProgress = (job: any) => {
    if (!job.milestones || job.milestones.length === 0) return 0;
    const completed = job.milestones.filter((m: any) => m.status === 'completed').length;
    return Math.round((completed / job.milestones.length) * 100);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Developer Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Find jobs, manage proposals, and track your work
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Person />}
              onClick={() => router.push('/profile/developer')}
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
              startIcon={<Search />}
              onClick={() => router.push('/jobs')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Browse Jobs
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
                      Active Contracts
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
                      {stats.activeContracts}
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
                    +1 this month
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
                      Proposals Sent
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
                      {stats.proposalsSent}
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
                    <Send sx={{ fontSize: 28 }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                    +3 this week
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
                      Jobs Completed
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
                      {stats.jobsCompleted}
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
                    <CheckCircle sx={{ fontSize: 28 }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {stats.jobsCompleted} successful projects
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
                      Total Earned
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
                      ${stats.totalEarned.toLocaleString()}
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
              <Tab label={`Available Jobs (${availableJobs.length})`} value="jobs" />
              <Tab label={`My Proposals (${myProposals.length})`} value="proposals" />
              <Tab label={`Contracts (${activeContracts.length})`} value="contracts" />
              <Tab label="Messages" value="messages" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {activeTab === 'overview' && (
              <LazySection minHeight={400}>
                <OverviewTab
                  availableJobs={availableJobs}
                  myProposals={myProposals}
                  activeContracts={transformedActiveContracts}
                  router={router}
                  getJobProgress={getJobProgress}
                />
              </LazySection>
            )}

            {activeTab === 'jobs' && (
              <LazySection minHeight={400}>
                <JobsTab jobs={availableJobs} router={router} />
              </LazySection>
            )}

            {activeTab === 'proposals' && (
              <LazySection minHeight={400}>
                <ProposalsTab proposals={myProposals} router={router} />
              </LazySection>
            )}

            {activeTab === 'contracts' && (
              <LazySection minHeight={400}>
                <ContractsTab contracts={transformedActiveContracts} router={router} getJobProgress={getJobProgress} />
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
const OverviewTab = ({ availableJobs, myProposals, activeContracts, router, getJobProgress }: any) => {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Available Jobs */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Available Jobs
            </Typography>
            <Button size="small" onClick={() => router.push('/developer?tab=jobs')}>
              View All
            </Button>
          </Box>
          {availableJobs.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Available Jobs
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Check back later for new job opportunities
              </Typography>
              <Button variant="contained" onClick={() => router.push('/jobs')} startIcon={<Search />}>
                Browse All Jobs
              </Button>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {availableJobs.slice(0, 3).map((job: any) => (
              <Paper key={job.id} sx={{ p: 2, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      {job.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {job.proposalCount || 0} proposals
                      </Typography>
                      {job.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ${job.budget.toLocaleString()}
                  </Typography>
                </Box>
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {job.requiredSkills.slice(0, 3).map((jobSkill: any) => (
                      <Chip key={jobSkill.skill.name} label={jobSkill.skill.name} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
              </Paper>
            ))}
            </Box>
          )}
        </Grid>

        {/* My Proposals */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              My Proposals
            </Typography>
            <Button size="small" onClick={() => router.push('/developer?tab=proposals')}>
              View All
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {myProposals.slice(0, 3).map((proposal: any) => (
              <Paper key={proposal.id} sx={{ p: 2, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  {proposal.jobTitle}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ${proposal.bid.toLocaleString()}
                    </Typography>
                    {proposal.proposedDuration && (
                      <Typography variant="caption" color="text.secondary">
                        Estimated {proposal.proposedDuration} days
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={proposal.status}
                    size="small"
                    color={proposal.status === 'ACCEPTED' ? 'success' : 'info'}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Active Contracts */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Active Contracts
            </Typography>
            {activeContracts.length > 0 && (
              <Button size="small" onClick={() => router.push('/developer?tab=contracts')}>
                View All
              </Button>
            )}
          </Box>
          {activeContracts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Active Contracts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                When your proposals are accepted, contracts will appear here
              </Typography>
              <Button variant="contained" onClick={() => router.push('/jobs')} startIcon={<Search />}>
                Browse Jobs
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {activeContracts.map((contract: any) => (
              <Grid size={{ xs: 12, md: 6 }} key={contract.id}>
                <Paper sx={{ p: 3, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56 }}>{contract.client.name.charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {contract.client.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                        <Typography variant="body2">{contract.client.rating}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {contract.title}
                      </Typography>
                    </Box>
                  </Box>
                  {(contract.status === 'IN_PROGRESS' || contract.status === 'UNDER_REVIEW') && contract.milestones && contract.milestones.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight="600">
                          {contract.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={contract.progress} sx={{ height: 8, borderRadius: 1 }} />
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ${contract.budget.toLocaleString()}
                    </Typography>
                    <Chip
                      label={contract.status}
                      size="small"
                      color={contract.status === 'UNDER_REVIEW' ? 'warning' : 'primary'}
                      icon={contract.status === 'UNDER_REVIEW' ? <Schedule /> : <CheckCircle />}
                    />
                  </Box>
                </Paper>
              </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Jobs Tab Component
const JobsTab = ({ jobs, router }: any) => {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Available Jobs
        </Typography>
        <Button variant="contained" startIcon={<Search />} onClick={() => router.push('/jobs')}>
          Browse All Jobs
        </Button>
      </Box>
      {jobs.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Work sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            No Jobs Available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            There are currently no open jobs matching your criteria.
          </Typography>
          <Button variant="contained" startIcon={<Search />} onClick={() => router.push('/jobs')}>
            Browse All Jobs
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {jobs.map((job: any) => (
          <Paper key={job.id} sx={{ p: 3, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {job.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip label={job.category} size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {job.proposalCount || 0} proposals
                  </Typography>
                  {job.createdAt && (
                    <Typography variant="body2" color="text.secondary">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {job.requiredSkills.map((jobSkill: any) => (
                      <Chip key={jobSkill.skill.name} label={jobSkill.skill.name} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
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
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<Visibility />}
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                View Details
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<Send />}
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                Submit Proposal
              </Button>
            </Box>
          </Paper>
        ))}
        </Box>
      )}
    </Box>
  );
};

// Proposals Tab Component
const ProposalsTab = ({ proposals, router }: any) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        My Proposals
      </Typography>
      {proposals.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Send sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            No Proposals Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Start applying to jobs to see your proposals here.
          </Typography>
          <Button variant="contained" startIcon={<Search />} onClick={() => router.push('/jobs')}>
            Browse Jobs
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {proposals.map((proposal: any) => (
          <Paper key={proposal.id} sx={{ p: 3, borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  {proposal.jobTitle}
                </Typography>
                {proposal.submittedAt && (
                  <Typography variant="body2" color="text.secondary">
                    Submitted {new Date(proposal.submittedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
              <Chip
                label={proposal.status}
                size="small"
                color={proposal.status === 'ACCEPTED' ? 'success' : 'info'}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ${proposal.bid.toLocaleString()}
                </Typography>
                {proposal.proposedDuration && (
                  <Typography variant="caption" color="text.secondary">
                    Estimated {proposal.proposedDuration} days
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => router.push(`/jobs/${proposal.jobId}`)}
                >
                  View Job
                </Button>
                {proposal.status === 'PENDING' && (
                  <Button variant="outlined" size="small" color="error">
                    Withdraw
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        ))}
        </Box>
      )}
    </Box>
  );
};

// Contracts Tab Component
const ContractsTab = ({ contracts, router, getJobProgress }: any) => {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Active Contracts
      </Typography>
      {contracts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            No Active Contracts
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            When your proposals are accepted, contracts will appear here.
          </Typography>
          <Button variant="contained" startIcon={<Search />} onClick={() => router.push('/jobs')}>
            Browse Jobs
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {contracts.map((contract: any) => (
          <Grid size={{ xs: 12, md: 6 }} key={contract.id}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%', '&:hover': { boxShadow: 4 } }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64 }}>{contract.client.name.charAt(0)}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="600">
                    {contract.client.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="body2" fontWeight="600">
                      {contract.client.rating}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {contract.title}
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              {(contract.status === 'IN_PROGRESS' || contract.status === 'UNDER_REVIEW') && contract.milestones && contract.milestones.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="caption" fontWeight="600">
                      {contract.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={contract.progress} sx={{ height: 8, borderRadius: 1 }} />
                  {contract.milestones && contract.milestones.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {contract.milestones.slice(0, 3).map((milestone: any) => (
                        <Box key={milestone.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle
                            fontSize="small"
                            color={milestone.status === 'completed' ? 'success' : 'disabled'}
                          />
                          <Typography variant="caption" sx={{ flex: 1 }}>
                            {milestone.title}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ${contract.budget.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {contract.currency}
                  </Typography>
                </Box>
                <Chip
                  label={contract.status}
                  size="small"
                  color={contract.status === 'UNDER_REVIEW' ? 'warning' : 'primary'}
                  icon={contract.status === 'UNDER_REVIEW' ? <Schedule /> : <CheckCircle />}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  fullWidth 
                  startIcon={<Message />}
                  onClick={() => router.push(`/messages?jobId=${contract.id}`)}
                >
                  Message
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  fullWidth
                  onClick={() => router.push(`/jobs/${contract.id}`)}
                >
                  View Details
                </Button>
              </Box>
            </Paper>
          </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Messages Tab Component
const MessagesTab = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Message sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        No Messages Yet
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Start a conversation with your clients or respond to messages.
      </Typography>
    </Box>
  );
};

