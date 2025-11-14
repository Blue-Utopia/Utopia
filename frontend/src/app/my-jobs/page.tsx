'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function MyJobsPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'client' | 'developer'>('client');

  // Mock data
  const myJobsAsClient = [
    {
      id: '1',
      title: 'Full Stack Developer Needed',
      status: 'OPEN',
      budget: 5000,
      proposalCount: 8,
      createdAt: '2 days ago',
    },
  ];

  const myJobsAsDeveloper = [
    {
      id: '2',
      title: 'Smart Contract Audit',
      status: 'IN_PROGRESS',
      budget: 3000,
      client: { username: 'cryptoStartup' },
      deadline: '5 days left',
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Please Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to view your jobs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Jobs</h1>
          <p className="text-gray-600">
            Manage your jobs as a client or view your work as a developer.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'client'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              As Client ({myJobsAsClient.length})
            </button>
            <button
              onClick={() => setActiveTab('developer')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'developer'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              As Developer ({myJobsAsDeveloper.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'client' && (
              <div className="space-y-4">
                {myJobsAsClient.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link href={`/jobs/${job.id}`}>
                          <h3 className="text-lg font-bold text-primary-600 hover:text-primary-700 mb-2">
                            {job.title}
                          </h3>
                        </Link>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
                            {job.status}
                          </span>
                          <span>{job.proposalCount} proposals</span>
                          <span>Posted {job.createdAt}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          ${job.budget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {myJobsAsClient.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                    <Link href="/post-job" className="btn btn-primary">
                      Post Your First Job
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'developer' && (
              <div className="space-y-4">
                {myJobsAsDeveloper.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link href={`/jobs/${job.id}`}>
                          <h3 className="text-lg font-bold text-primary-600 hover:text-primary-700 mb-2">
                            {job.title}
                          </h3>
                        </Link>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
                            {job.status}
                          </span>
                          <span>Client: @{job.client.username}</span>
                          <span>{job.deadline}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          ${job.budget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {myJobsAsDeveloper.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't been hired for any jobs yet.</p>
                    <Link href="/jobs" className="btn btn-primary">
                      Browse Available Jobs
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

