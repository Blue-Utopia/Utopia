'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  // Mock data - will be replaced with GraphQL query
  const jobs = [
    {
      id: '1',
      title: 'Full Stack Developer Needed for DeFi Project',
      description: 'Looking for an experienced full-stack developer to build a DeFi dashboard...',
      budget: 5000,
      currency: 'USDC',
      category: 'Development',
      skills: ['React', 'Node.js', 'Solidity'],
      proposalCount: 8,
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Smart Contract Audit Required',
      description: 'Need a security expert to audit our escrow smart contracts...',
      budget: 3000,
      currency: 'USDT',
      category: 'Security',
      skills: ['Solidity', 'Security', 'Auditing'],
      proposalCount: 5,
      createdAt: '5 hours ago',
    },
    {
      id: '3',
      title: 'UI/UX Designer for Web3 App',
      description: 'Seeking a talented designer to create modern UI for our dApp...',
      budget: 2500,
      currency: 'ETH',
      category: 'Design',
      skills: ['Figma', 'UI/UX', 'Web3'],
      proposalCount: 12,
      createdAt: '1 day ago',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Find Work
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse available jobs and submit proposals to get hired.
          </Typography>
        </Box>

        {/* Search and Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="development">Development</MenuItem>
                    <MenuItem value="design">Design</MenuItem>
                    <MenuItem value="security">Security</MenuItem>
                    <MenuItem value="marketing">Marketing</MenuItem>
                    <MenuItem value="writing">Writing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button variant="outlined" startIcon={<FilterList />} fullWidth>
                  Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {jobs.map((job) => (
            <Card key={job.id} sx={{ '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.3s' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      component={Link}
                      href={`/jobs/${job.id}`}
                      variant="h6"
                      fontWeight="bold"
                      color="primary"
                      sx={{ textDecoration: 'none', mb: 1, display: 'block', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {job.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {job.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right', ml: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      ${job.budget.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {job.currency}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip label={job.category} size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {job.proposalCount} proposals
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.createdAt}
                    </Typography>
                  </Box>
                  <Button component={Link} href={`/jobs/${job.id}`} variant="contained">
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Empty State */}
        {jobs.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No jobs found matching your criteria.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
