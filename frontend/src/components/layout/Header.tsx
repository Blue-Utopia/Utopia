'use client';

import { useState, useEffect, useRef } from 'react';
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
  Container,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Notifications, 
  Mail, 
  Settings, 
  Help, 
  Language, 
  Logout,
  Person,
  Verified,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { isConnected } = useAccount();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    return user?.displayName || user?.username || user?.email?.split('@')[0] || 'User';
  };

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
                <Skeleton variant="circular" width={40} height={40} />
              </>
            ) : isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleAvatarClick}
                  sx={{ p: 0 }}
                  aria-label="account menu"
                  aria-controls={menuOpen ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                >
                  <Avatar
                    src={user?.avatar || undefined}
                    alt={getUserDisplayName()}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 2,
                      },
                    }}
                  >
                    {!user?.avatar && getUserDisplayName().charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={menuOpen}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      minWidth: 280,
                      '& .MuiAvatar-root': {
                        width: 56,
                        height: 56,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  {/* User Info Section */}
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Avatar
                        src={user?.avatar || undefined}
                        alt={getUserDisplayName()}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'primary.main',
                        }}
                      >
                        {!user?.avatar && getUserDisplayName().charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                          {getUserDisplayName()}
                        </Typography>
                        {user?.role && (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {user.role === 'CLIENT' ? 'Client' : user.role === 'DEVELOPER' ? 'Developer' : 'Freelancer'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      <Button
                        component={Link}
                        href="/profile/settings"
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ fontSize: '0.75rem' }}
                      >
                        View profile
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        sx={{ fontSize: '0.75rem' }}
                        startIcon={<Verified sx={{ fontSize: 16 }} />}
                      >
                        Verify
                      </Button>
                    </Box>
                  </Box>
                  <Divider />
                  
                  {/* Account Section */}
                  <Box sx={{ px: 1, py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block' }}>
                      Account
                    </Typography>
                    <MenuItem component={Link} href="/premium">
                      <ListItemIcon>
                        <Box sx={{ width: 20, height: 20, bgcolor: 'warning.main', borderRadius: 0.5 }} />
                      </ListItemIcon>
                      <ListItemText primary="Try Premium for free" />
                    </MenuItem>
                    <MenuItem component={Link} href="/profile/settings">
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Settings & Privacy" />
                    </MenuItem>
                    <MenuItem component={Link} href="/help">
                      <ListItemIcon>
                        <Help fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Help" />
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon>
                        <Language fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Language" />
                    </MenuItem>
                  </Box>
                  <Divider />
                  
                  {/* Manage Section */}
                  <Box sx={{ px: 1, py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block' }}>
                      Manage
                    </Typography>
                    <MenuItem component={Link} href="/my-jobs">
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Posts & Activity" />
                    </MenuItem>
                    <MenuItem component={Link} href="/post-job">
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Job Posting Account" />
                    </MenuItem>
                  </Box>
                  <Divider />
                  
                  {/* Sign Out */}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" />
                  </MenuItem>
                </Menu>
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

