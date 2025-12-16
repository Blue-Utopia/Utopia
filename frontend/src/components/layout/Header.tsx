'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Badge, 
  IconButton,
  Skeleton,
  Container
} from '@mui/material';
import { Notifications, Mail } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { isConnected } = useAccount();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 2 }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              DFM
            </Box>
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'inline' },
                color: 'text.primary',
              }}
            >
              Freelance Marketplace
            </Typography>
          </Link>

          {/* Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            <Button component={Link} href="/jobs" color="inherit" sx={{ fontWeight: 500 }}>
              Find Work
            </Button>
            <Button component={Link} href="/post-job" color="inherit" sx={{ fontWeight: 500 }}>
              Post Job
            </Button>
            <Button component={Link} href="/my-jobs" color="inherit" sx={{ fontWeight: 500 }}>
              My Jobs
            </Button>
            {mounted && isConnected && (
              <>
                <IconButton component={Link} href="/messages" color="inherit">
                  <Badge badgeContent={0} color="error">
                    <Mail />
                  </Badge>
                </IconButton>
                <IconButton component={Link} href="/notifications" color="inherit">
                  <Badge badgeContent={0} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </>
            )}
          </Box>

          {/* Auth Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!mounted || authLoading ? (
              <>
                <Skeleton variant="rectangular" width={64} height={32} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
              </>
            ) : isAuthenticated ? (
              <>
                {user && (
                  <Typography
                    component={Link}
                    href="/profile/settings"
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      fontSize: '0.875rem',
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {user.displayName || user.username || user.email}
                  </Typography>
                )}
                <Button
                  component={Link}
                  href="/profile/settings"
                  color="inherit"
                  sx={{ fontSize: '0.875rem' }}
                >
                  Profile
                </Button>
                <Button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  color="inherit"
                  sx={{ fontSize: '0.875rem' }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/signin"
                  color="inherit"
                  sx={{ fontSize: '0.875rem' }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  href="/signup"
                  variant="contained"
                  sx={{ fontSize: '0.875rem' }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

