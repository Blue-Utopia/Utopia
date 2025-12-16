'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layout, Typography, Card, Input, Select, Button, Tag, Row, Col, Space, Empty } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { LazySection } from '@/components/LazySection';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

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
    <Layout style={{ minHeight: '100vh', background: '#F7F7F7' }}>
      <Content style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8, fontWeight: 700, color: '#222222' }}>
            Find Work
          </Title>
          <Paragraph style={{ fontSize: '1.125rem', color: '#6B6B6B', margin: 0 }}>
            Browse available jobs and submit proposals to get hired.
          </Paragraph>
        </div>

        {/* Search and Filter */}
        <Card style={{ marginBottom: 24, borderRadius: 12, border: '1px solid #EEEEEE' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={24} md={{ span: 12 }}>
              <Input
                placeholder="Search jobs..."
                prefix={<SearchOutlined />}
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col span={24} sm={{ span: 12 }} md={{ span: 6 }}>
              <Select
                placeholder="Category"
                size="large"
                value={category}
                onChange={setCategory}
                style={{ width: '100%', borderRadius: 8 }}
              >
                <Option value="all">All Categories</Option>
                <Option value="development">Development</Option>
                <Option value="design">Design</Option>
                <Option value="security">Security</Option>
                <Option value="marketing">Marketing</Option>
                <Option value="writing">Writing</Option>
              </Select>
            </Col>
            <Col span={24} sm={{ span: 12 }} md={{ span: 6 }}>
              <Button
                icon={<FilterOutlined />}
                size="large"
                block
                style={{ borderRadius: 8 }}
              >
                Filters
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Job Listings */}
        <LazySection minHeight={300}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {jobs.map((job) => (
            <Card
              key={job.id}
              style={{
                borderRadius: 12,
                border: '1px solid #EEEEEE',
                transition: 'all 0.2s ease',
              }}
              hoverable
              bodyStyle={{ padding: 24 }}
            >
              <Row gutter={[24, 16]}>
                <Col span={24} lg={{ span: 18 }}>
                  <Link href={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                    <Title
                      level={4}
                      style={{
                        marginBottom: 12,
                        fontWeight: 600,
                        color: '#14A800',
                        fontSize: '1.25rem',
                      }}
                    >
                      {job.title}
                    </Title>
                  </Link>
                  <Paragraph
                    style={{
                      color: '#6B6B6B',
                      marginBottom: 16,
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {job.description}
                  </Paragraph>
                  <Space wrap style={{ marginBottom: 16 }}>
                    {job.skills.map((skill) => (
                      <Tag
                        key={skill}
                        style={{
                          borderRadius: 6,
                          padding: '4px 12px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          border: '1px solid #E0E0E0',
                          background: '#FAFAFA',
                        }}
                      >
                        {skill}
                      </Tag>
                    ))}
                  </Space>
                </Col>
                <Col span={24} lg={{ span: 6 }} style={{ textAlign: 'right' }}>
                  <Title
                    level={3}
                    style={{
                      marginBottom: 4,
                      fontWeight: 700,
                      color: '#14A800',
                    }}
                  >
                    ${job.budget.toLocaleString()}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                    {job.currency}
                  </Text>
                </Col>
              </Row>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 20,
                  borderTop: '1px solid #EEEEEE',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <Space wrap>
                  <Tag style={{ borderRadius: 6, fontWeight: 500 }}>{job.category}</Tag>
                  <Text type="secondary" style={{ fontSize: '0.875rem' }}>
                    {job.proposalCount} proposals
                  </Text>
                  <Text type="secondary" style={{ fontSize: '0.875rem' }}>
                    {job.createdAt}
                  </Text>
                </Space>
                <Button
                  type="primary"
                  href={`/jobs/${job.id}`}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  View Details
                </Button>
              </div>
            </Card>
            ))}
          </Space>
        </LazySection>

        {/* Empty State */}
        {jobs.length === 0 && (
          <Card>
            <Empty
              description={
                <Text type="secondary">No jobs found matching your criteria.</Text>
              }
            />
          </Card>
        )}
      </Content>
    </Layout>
  );
}
