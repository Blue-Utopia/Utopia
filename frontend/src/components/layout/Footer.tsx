'use client';

import Link from 'next/link';
import { Box, Container, Typography, IconButton, Divider, Grid } from '@mui/material';
import { GitHub, Twitter, Telegram } from '@mui/icons-material';

export function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              About
            </Typography>
            <Typography variant="body2" color="grey.400">
              A decentralized freelance marketplace powered by blockchain technology. Work freely, get paid instantly.
            </Typography>
          </Grid>

          {/* For Freelancers */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              For Freelancers
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { href: '/jobs', label: 'Find Work' },
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/skills', label: 'Skill Tests' },
                { href: '/success-stories', label: 'Success Stories' },
              ].map((item) => (
                <li key={item.href}>
                  <Typography
                    component={Link}
                    href={item.href}
                    variant="body2"
                    sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: 'white' } }}
                  >
                    {item.label}
                  </Typography>
                </li>
              ))}
            </Box>
          </Grid>

          {/* For Clients */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              For Clients
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { href: '/post-job', label: 'Post a Job' },
                { href: '/browse-talent', label: 'Browse Talent' },
                { href: '/enterprise', label: 'Enterprise' },
                { href: '/pricing', label: 'Pricing' },
              ].map((item) => (
                <li key={item.href}>
                  <Typography
                    component={Link}
                    href={item.href}
                    variant="body2"
                    sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: 'white' } }}
                  >
                    {item.label}
                  </Typography>
                </li>
              ))}
            </Box>
          </Grid>

          {/* Support */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Support
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { href: '/help', label: 'Help Center' },
                { href: '/docs', label: 'Documentation' },
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact Us' },
              ].map((item) => (
                <li key={item.href}>
                  <Typography
                    component={Link}
                    href={item.href}
                    variant="body2"
                    sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: 'white' } }}
                  >
                    {item.label}
                  </Typography>
                </li>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Social Links & Copyright */}
        <Divider sx={{ borderColor: 'grey.800', my: 4 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton
              component="a"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
            >
              <GitHub />
            </IconButton>
            <IconButton
              component="a"
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
            >
              <Twitter />
            </IconButton>
            <IconButton
              component="a"
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
            >
              <Box component="span" sx={{ fontSize: '1.5rem' }}>D</Box>
            </IconButton>
            <IconButton
              component="a"
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
            >
              <Telegram />
            </IconButton>
          </Box>
          <Typography variant="body2" color="grey.400">
            © 2024 Decentralized Freelance Marketplace. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

