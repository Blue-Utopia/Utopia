'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaSearch, FaFilter } from 'react-icons/fa';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Find Work</h1>
          <p className="text-gray-600">
            Browse available jobs and submit proposals to get hired.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                <option value="all">All Categories</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="security">Security</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Writing</option>
              </select>
            </div>
            <button className="btn btn-outline flex items-center gap-2">
              <FaFilter /> Filters
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link href={`/jobs/${job.id}`}>
                    <h2 className="text-xl font-bold text-primary-600 hover:text-primary-700 mb-2">
                      {job.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mb-3">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-green-600">
                    ${job.budget.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">{job.currency}</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t">
                <div className="flex gap-4">
                  <span className="bg-gray-100 px-3 py-1 rounded">{job.category}</span>
                  <span>{job.proposalCount} proposals</span>
                  <span>{job.createdAt}</span>
                </div>
                <Link href={`/jobs/${job.id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

