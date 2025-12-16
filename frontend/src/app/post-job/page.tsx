'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Grid,
} from '@mui/material';

export default function PostJobPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'development',
    budget: '',
    currency: 'USDC',
    paymentToken: '0x...', // Will be set based on currency
    estimatedDuration: '',
    deadline: '',
    tags: '',
    requiredSkills: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please connect your wallet and authenticate');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Submit to GraphQL API
      console.log('Submitting job:', formData);

      toast.success('Job posted successfully!');
      router.push('/my-jobs');
    } catch (error: any) {
      console.error('Job posting error:', error);
      toast.error(error.message || 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Post a Job
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find the perfect freelancer for your project.
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Title */}
              <TextField
                label="Job Title"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Full Stack Developer for DeFi Project"
              />

              {/* Description */}
              <TextField
                label="Description"
                required
                fullWidth
                multiline
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project in detail..."
              />

              {/* Category */}
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="development">Development</MenuItem>
                  <MenuItem value="design">Design</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="writing">Writing</MenuItem>
                </Select>
              </FormControl>

              {/* Budget and Currency */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Budget (USD)"
                    type="number"
                    required
                    fullWidth
                    inputProps={{ min: 1 }}
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="5000"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Currency</InputLabel>
                    <Select
                      required
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      label="Payment Currency"
                    >
                      <MenuItem value="USDC">USDC</MenuItem>
                      <MenuItem value="USDT">USDT</MenuItem>
                      <MenuItem value="ETH">ETH</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Duration and Deadline */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Estimated Duration (days)"
                    type="number"
                    fullWidth
                    inputProps={{ min: 1 }}
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    placeholder="30"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Deadline"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </Grid>
              </Grid>

              {/* Required Skills */}
              <TextField
                label="Required Skills"
                required
                fullWidth
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                placeholder="React, Node.js, Solidity (comma separated)"
                helperText="Separate skills with commas"
              />

              {/* Tags */}
              <TextField
                label="Tags"
                fullWidth
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="web3, defi, frontend (comma separated)"
              />

              {/* Info */}
              <Alert severity="info">
                <strong>Note:</strong> After posting, you'll need to deposit 50% of the budget into escrow before work can begin.
              </Alert>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ flex: 1 }}>
                  {isSubmitting ? 'Posting...' : 'Post Job'}
                </Button>
                <Button type="button" variant="outlined" onClick={() => router.back()}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
