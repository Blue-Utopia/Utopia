'use client';

import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Paper,
  Grid,
} from '@mui/material';
import {
  Security,
  AccountBalanceWallet,
  RocketLaunch,
  Bolt,
} from '@mui/icons-material';

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
          color: 'white',
          py: 10,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
            <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
              Decentralized Freelance Marketplace
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.9)' }}>
              Work freely. Get paid instantly. No middlemen. Pure crypto.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
              <Button
                component={Link}
                href="/jobs"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.125rem',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Find Work
              </Button>
              <Button
                component={Link}
                href="/post-job"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.125rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'white',
                    color: 'primary.main',
                  },
                }}
              >
                Hire Talent
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Why Choose Us?
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.100', width: 64, height: 64 }}>
                      <Security sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Avatar>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Trustless Escrow
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Smart contract escrow ensures secure payments. No disputes, no delays.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.100', width: 64, height: 64 }}>
                      <AccountBalanceWallet sx={{ fontSize: 32, color: 'secondary.main' }} />
                    </Avatar>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Crypto Payments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get paid in USDC, USDT, or ETH. Instant withdrawals, global reach.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.light', width: 64, height: 64 }}>
                      <RocketLaunch sx={{ fontSize: 32, color: 'success.main' }} />
                    </Avatar>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    No KYC Required
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start working immediately. Skills matter, not documents.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.light', width: 64, height: 64 }}>
                      <Bolt sx={{ fontSize: 32, color: 'warning.main' }} />
                    </Avatar>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    On-Chain Reputation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Build immutable reputation. Your work history follows you forever.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            How It Works
          </Typography>

          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* For Developers */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom sx={{ mb: 3 }}>
                For Developers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { step: 1, title: 'Connect Your Wallet', desc: 'No email, no password. Just your Web3 wallet.' },
                  { step: 2, title: 'Build Your Profile', desc: 'Showcase skills, portfolio, and pass coding tests.' },
                  { step: 3, title: 'Apply to Jobs', desc: 'Submit proposals and get hired based on merit.' },
                  { step: 4, title: 'Deliver & Get Paid', desc: 'Complete work, client approves, instant crypto payment.' },
                ].map((item) => (
                  <Box key={item.step} sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, flexShrink: 0 }}>
                      {item.step}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* For Clients */}
            <Box>
              <Typography variant="h5" fontWeight="bold" color="secondary.main" gutterBottom sx={{ mb: 3 }}>
                For Clients
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { step: 1, title: 'Verify Phone & Connect Wallet', desc: 'Quick SMS verification and wallet connection.' },
                  { step: 2, title: 'Post Your Job', desc: 'Describe your project, budget, and timeline.' },
                  { step: 3, title: 'Review Proposals', desc: 'Choose the best developer based on skills and reputation.' },
                  { step: 4, title: 'Deposit 50% & Get Work Done', desc: 'Escrow protects both parties. Pay remaining 50% on completion.' },
                ].map((item) => (
                  <Box key={item.step} sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, flexShrink: 0 }}>
                      {item.step}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4 }}>
              Join the future of freelancing today.
            </Typography>
            <Button
              component={Link}
              href="/jobs"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.125rem',
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              Explore Jobs
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

