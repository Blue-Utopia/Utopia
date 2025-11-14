'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Post a Job</h1>
          <p className="text-gray-600">
            Find the perfect freelancer for your project.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Title */}
          <div>
            <label className="label">Job Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Full Stack Developer for DeFi Project"
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project in detail..."
              rows={6}
              className="input"
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="security">Security</option>
              <option value="marketing">Marketing</option>
              <option value="writing">Writing</option>
            </select>
          </div>

          {/* Budget and Currency */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Budget (USD) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="5000"
                className="input"
              />
            </div>
            <div>
              <label className="label">Payment Currency *</label>
              <select
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input"
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>

          {/* Duration and Deadline */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Estimated Duration (days)</label>
              <input
                type="number"
                min="1"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                placeholder="30"
                className="input"
              />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="input"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="label">Required Skills *</label>
            <input
              type="text"
              required
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              placeholder="React, Node.js, Solidity (comma separated)"
              className="input"
            />
            <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="web3, defi, frontend (comma separated)"
              className="input"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After posting, you'll need to deposit 50% of the budget
              into escrow before work can begin.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

