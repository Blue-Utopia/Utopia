'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layout, Typography, Button, Input, Card, Row, Col, Avatar, Space, Tag, Badge } from 'antd';
import { LazySection } from '@/components/LazySection';
import { 
  SearchOutlined,
  RightOutlined,
  StarFilled,
  CheckCircleOutlined,
  TeamOutlined,
  ProjectOutlined,
  MessageOutlined,
  CodeOutlined,
  BgColorsOutlined,
  MobileOutlined,
  RiseOutlined,
  RocketOutlined,
  PlayCircleOutlined,
  UserOutlined,
  StarOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const popularTags = [
    'Web Development',
    'UI/UX Design',
    'Mobile App',
    'Content Writing',
    'Data Science',
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', width: '100%' }}>
      {/* Hero Section with Dark Gradient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #14b8a6 100%)',
          color: 'white',
          padding: '80px 24px 120px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '90vh',
          width: '100%',
          marginTop: 0,
        }}
      >
        {/* Wave at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            background: 'linear-gradient(to top, #f8fafc 0%, transparent 100%)',
            clipPath: 'polygon(0 50%, 100% 0%, 100% 100%, 0% 100%)',
          }}
        />

        <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Row gutter={[48, 48]} align="middle">
            {/* Left Side - Hero Content */}
            <Col span={24} lg={{ span: 14 }}>
              {/* Trusted Badge */}
              <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
                <StarFilled style={{ color: '#14A800', fontSize: 16 }} />
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: 500 }}>
                  Trusted by 100,000+ businesses
                </Text>
              </div>

              {/* Main Headline */}
              <Title
                level={1}
                style={{
                  color: 'white',
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  fontWeight: 700,
                  marginBottom: 24,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                }}
              >
                Find the perfect{' '}
                <span style={{ color: '#14b8a6', background: 'linear-gradient(135deg, #14b8a6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  freelance
                </span>{' '}
                talent for your project.
              </Title>

              {/* Description */}
              <Paragraph
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '1.125rem',
                  marginBottom: 40,
                  lineHeight: 1.7,
                  maxWidth: 600,
                }}
              >
                Connect with skilled professionals, manage projects seamlessly, and bring your ideas to life with our global network of top freelancers.
              </Paragraph>

              {/* Search Bar */}
              <div style={{ marginBottom: 24 }}>
                <Space.Compact style={{ width: '100%', maxWidth: 700 }}>
                  <Input
                    size="large"
                    placeholder="Search for jobs or skills..."
                    prefix={<SearchOutlined style={{ color: '#94a3b8', fontSize: 18 }} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      height: 56,
                      fontSize: '16px',
                      background: 'white',
                      border: 'none',
                      borderRadius: '12px 0 0 12px',
                      paddingLeft: 20,
                    }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<RightOutlined />}
                    style={{
                      height: 56,
                      fontSize: '16px',
                      fontWeight: 600,
                      borderRadius: '0 12px 12px 0',
                      background: '#14A800',
                      border: 'none',
                      padding: '0 32px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    Search
                  </Button>
                </Space.Compact>
              </div>

              {/* Popular Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', fontWeight: 500 }}>
                  Popular:
                </Text>
                <Space size={8} wrap>
                  {popularTags.map((tag) => (
                    <Tag
                      key={tag}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 20,
                        padding: '6px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Col>

            {/* Right Side - Statistics Card */}
            <Col span={24} lg={{ span: 10 }}>
              <Card
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 24,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                }}
                bodyStyle={{ padding: 32 }}
              >
                {/* Verified Freelancers Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: 24,
                    background: '#14A800',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(20, 168, 0, 0.3)',
                  }}
                >
                  <CheckCircleOutlined />
                  Verified Freelancers
                </div>

                {/* Statistics */}
                <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: 12 }}>
                        <ProjectOutlined
                          style={{
                            fontSize: 32,
                            color: '#14A800',
                            background: 'rgba(20, 168, 0, 0.1)',
                            padding: 12,
                            borderRadius: 12,
                          }}
                        />
                      </div>
                      <Title
                        level={2}
                        style={{
                          color: 'white',
                          marginBottom: 4,
                          fontWeight: 700,
                          fontSize: '2rem',
                        }}
                      >
                        10K+
                      </Title>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}>
                        Projects
                      </Text>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                      {/* Tooltip */}
                      <div
                        style={{
                          position: 'absolute',
                          top: -60,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(15, 23, 42, 0.95)',
                          backdropFilter: 'blur(10px)',
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        <Avatar.Group>
                          <Avatar style={{ background: '#fbbf24', color: 'white', fontSize: '12px' }}>U1</Avatar>
                          <Avatar style={{ background: '#f97316', color: 'white', fontSize: '12px' }}>U2</Avatar>
                          <Avatar style={{ background: '#ef4444', color: 'white', fontSize: '12px' }}>U3</Avatar>
                        </Avatar.Group>
                        <div>
                          <Text strong style={{ color: 'white', fontSize: '14px', display: 'block' }}>
                            500+
                          </Text>
                          <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                            Hired this week
                          </Text>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <TeamOutlined
                          style={{
                            fontSize: 32,
                            color: '#14A800',
                            background: 'rgba(20, 168, 0, 0.1)',
                            padding: 12,
                            borderRadius: 12,
                          }}
                        />
                      </div>
                      <Title
                        level={2}
                        style={{
                          color: 'white',
                          marginBottom: 4,
                          fontWeight: 700,
                          fontSize: '2rem',
                        }}
                      >
                        50K+
                      </Title>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}>
                        Freelancers
                      </Text>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: 12 }}>
                        <CheckCircleOutlined
                          style={{
                            fontSize: 32,
                            color: '#14A800',
                            background: 'rgba(20, 168, 0, 0.1)',
                            padding: 12,
                            borderRadius: 12,
                          }}
                        />
                      </div>
                      <Title
                        level={2}
                        style={{
                          color: 'white',
                          marginBottom: 4,
                          fontWeight: 700,
                          fontSize: '2rem',
                        }}
                      >
                        95%
                      </Title>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}>
                        Success Rate
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Browse by Category Section */}
      <LazySection>
        <Layout style={{ background: '#ffffff' }}>
          <Content style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title
              level={2}
              style={{
                marginBottom: 16,
                fontWeight: 700,
                color: '#1e293b',
                fontSize: '2.5rem',
              }}
            >
              Browse by Category
            </Title>
            <Paragraph
              style={{
                fontSize: '1.125rem',
                color: '#64748b',
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              Explore thousands of opportunities across different industries and skill sets.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {[
              { icon: <CodeOutlined />, title: 'Web Development', jobs: '1,234', color: '#3b82f6' },
              { icon: <BgColorsOutlined />, title: 'Design & Creative', jobs: '892', color: '#ec4899' },
              { icon: <MobileOutlined />, title: 'Mobile Development', jobs: '654', color: '#3b82f6' },
              { icon: <RiseOutlined />, title: 'Marketing', jobs: '789', color: '#14A800' },
              { icon: <RocketOutlined />, title: 'Data Science & AI', jobs: '432', color: '#9333ea' },
              { icon: <PlayCircleOutlined />, title: 'Video & Animation', jobs: '567', color: '#ef4444' },
              { icon: <UserOutlined />, title: 'Virtual Assistant', jobs: '345', color: '#475569' },
            ].map((category, index) => (
              <Col key={index} span={24} sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 6 }}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: 24 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: 40,
                        color: category.color,
                        marginBottom: 16,
                        background: `${category.color}15`,
                        padding: 16,
                        borderRadius: 12,
                      }}
                    >
                      {category.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: 8, fontWeight: 600, color: '#1e293b' }}>
                      {category.title}
                    </Title>
                    <Text style={{ color: '#64748b', fontSize: '14px' }}>
                      {category.jobs} jobs available
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              href="/jobs"
              style={{
                color: '#14A800',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              View All Categories <RightOutlined />
            </Link>
          </div>
        </div>
          </Content>
        </Layout>
      </LazySection>

      {/* Featured Jobs Section */}
      <LazySection>
        <Layout style={{ background: '#f8fafc' }}>
          <Content style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title
              level={2}
              style={{
                marginBottom: 16,
                fontWeight: 700,
                color: '#1e293b',
                fontSize: '2.5rem',
              }}
            >
              Featured Jobs
            </Title>
            <Paragraph
              style={{
                fontSize: '1.125rem',
                color: '#64748b',
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              Hand-picked opportunities from top clients.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {[
              {
                company: 'TechStart Inc.',
                location: 'San Francisco, USA',
                title: 'Build a Modern E-commerce Website with React',
                skills: ['React', 'Node.js', 'MongoDB'],
                rate: '$3000-$5000',
                time: '9 hours ago',
                featured: true,
              },
              {
                company: 'FitLife Solutions',
                location: 'Los Angeles, USA',
                title: 'iOS App Development for Fitness Tracking',
                skills: ['Swift', 'iOS', 'HealthKit'],
                rate: '$50-$80/hr',
                time: '9 hours ago',
                featured: true,
              },
              {
                company: 'EcoWear Co.',
                location: 'London, UK',
                title: 'Logo and Brand Identity Design',
                skills: ['Logo Design', 'Brand Identity', 'Adobe Illustrator'],
                rate: '$800-$1500',
                time: '9 hours ago',
                featured: false,
              },
              {
                company: 'Techinsider Media',
                location: 'Remote',
                title: 'SEO Content Writer for Tech Blog',
                skills: ['Content Writing', 'SEO', 'Technical Writing'],
                rate: '$100-$150',
                time: '9 hours ago',
                featured: false,
              },
              {
                company: 'GlowUp Skincare',
                location: 'Miami, USA',
                title: 'Social Media Marketing Campaign',
                skills: ['Social Media Marketing', 'Content Creation', 'Facebook Ads'],
                rate: '$30-$50/hr',
                time: '9 hours ago',
                featured: true,
              },
              {
                company: 'DataFlow Analytics',
                location: 'New York, USA',
                title: 'Machine Learning Model for Customer Churn Prediction',
                skills: ['Python', 'Machine Learning', 'TensorFlow'],
                rate: '$5000-$8000',
                time: '9 hours ago',
                featured: false,
              },
            ].map((job, index) => (
              <Col key={index} span={24} sm={{ span: 12 }} lg={{ span: 8 }}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    position: 'relative',
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  {job.featured && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: '#14A800',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: '11px',
                        fontWeight: 600,
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Featured
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: '#14A800',
                        marginBottom: 12,
                      }}
                    >
                      {job.company.charAt(0)}
                    </Avatar>
                    <div>
                      <Text strong style={{ fontSize: '16px', color: '#1e293b', display: 'block' }}>
                        {job.company}
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: '14px' }}>{job.location}</Text>
                    </div>
                  </div>
                  <Title level={5} style={{ marginBottom: 12, fontWeight: 600, color: '#1e293b' }}>
                    {job.title}
                  </Title>
                  <Space wrap style={{ marginBottom: 16 }}>
                    {job.skills.map((skill) => (
                      <Tag key={skill} style={{ borderRadius: 6, fontSize: '12px' }}>
                        {skill}
                      </Tag>
                    ))}
                  </Space>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ color: '#14A800', fontSize: '16px' }}>
                      {job.rate}
                    </Text>
                    <Text style={{ color: '#94a3b8', fontSize: '13px' }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {job.time}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              href="/jobs"
              style={{
                color: '#14A800',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              View All Jobs <RightOutlined />
            </Link>
          </div>
        </div>
          </Content>
        </Layout>
      </LazySection>

      {/* Top Freelancers Section */}
      <LazySection>
        <Layout style={{ background: '#ffffff' }}>
          <Content style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title
              level={2}
              style={{
                marginBottom: 16,
                fontWeight: 700,
                color: '#1e293b',
                fontSize: '2.5rem',
              }}
            >
              Top Freelancers
            </Title>
            <Paragraph
              style={{
                fontSize: '1.125rem',
                color: '#64748b',
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              Work with our highest-rated professionals.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {[
              {
                name: 'Marcus Johnson',
                profession: 'Designer',
                rating: 5.0,
                reviews: 84,
                location: 'New York, USA',
                skills: ['UI Design', 'UX Research', 'Figma'],
                jobs: 54,
                rate: '$85/hr',
              },
              {
                name: 'Sarah Chen',
                profession: 'Web Developer',
                rating: 4.9,
                reviews: 127,
                location: 'San Francisco, USA',
                skills: ['React', 'Node.js', 'JavaScript'],
                jobs: 123,
                rate: '$75/hr',
              },
              {
                name: 'Alex Rivera',
                profession: 'Marketer',
                rating: 4.8,
                reviews: 67,
                location: 'Austin, USA',
                skills: ['Google Ads', 'Facebook Ads', 'SEO'],
                jobs: 54,
                rate: '$65/hr',
              },
              {
                name: 'Emma Thompson',
                profession: 'Writer',
                rating: 4.7,
                reviews: 90,
                location: 'London, UK',
                skills: ['Content Writing', 'Copywriting'],
                jobs: 156,
                rate: '$45/hr',
              },
              {
                name: 'James Wilson',
                profession: 'Virtual Assistant',
                rating: 4.6,
                reviews: 134,
                location: 'Manila, Philippines',
                skills: ['Project Management', 'Customer Service', 'Data Entry'],
                jobs: 195,
                rate: '$25/hr',
              },
            ].map((freelancer, index) => (
              <Col key={index} span={24} sm={{ span: 12 }} lg={{ span: 8 }}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Avatar
                      size={80}
                      style={{
                        backgroundColor: '#14A800',
                        marginBottom: 16,
                      }}
                    >
                      {freelancer.name.charAt(0)}
                    </Avatar>
                    <Title level={4} style={{ marginBottom: 4, fontWeight: 600, color: '#1e293b' }}>
                      {freelancer.name}
                    </Title>
                    <Text style={{ color: '#64748b', fontSize: '14px', display: 'block', marginBottom: 8 }}>
                      {freelancer.profession}
                    </Text>
                    <div style={{ marginBottom: 8 }}>
                      <StarFilled style={{ color: '#fbbf24', fontSize: 16 }} />
                      <Text strong style={{ marginLeft: 4, color: '#1e293b' }}>
                        {freelancer.rating}
                      </Text>
                      <Text style={{ color: '#64748b', marginLeft: 4 }}>
                        ({freelancer.reviews} reviews)
                      </Text>
                    </div>
                    <Text style={{ color: '#64748b', fontSize: '13px', display: 'block', marginBottom: 16 }}>
                      {freelancer.location}
                    </Text>
                  </div>
                  <Space wrap style={{ marginBottom: 16, justifyContent: 'center' }}>
                    {freelancer.skills.map((skill) => (
                      <Tag key={skill} style={{ borderRadius: 6, fontSize: '12px' }}>
                        {skill}
                      </Tag>
                    ))}
                  </Space>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                    <Text style={{ color: '#64748b', fontSize: '14px' }}>
                      {freelancer.jobs} jobs
                    </Text>
                    <Text strong style={{ color: '#14A800', fontSize: '16px' }}>
                      {freelancer.rate}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              href="/freelancers"
              style={{
                color: '#14A800',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Browse All Talent <RightOutlined />
            </Link>
          </div>
        </div>
          </Content>
        </Layout>
      </LazySection>

      {/* Ready to Get Started Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #14A800 0%, #14b8a6 100%)',
          color: 'white',
          padding: '100px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <Title
            level={2}
            style={{
              color: 'white',
              marginBottom: 16,
              fontWeight: 700,
              fontSize: '2.5rem',
            }}
          >
            Ready to Get Started?
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: '1.125rem',
              marginBottom: 48,
              maxWidth: 700,
              margin: '0 auto 48px',
            }}
          >
            Join thousands of businesses and freelancers who are already achieving their goals on our platform.
          </Paragraph>

          <Space size={16} style={{ marginBottom: 64, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              size="large"
              href="/post-job"
              icon={<RightOutlined />}
              style={{
                background: 'white',
                color: '#14A800',
                height: 56,
                padding: '0 32px',
                fontSize: '1.125rem',
                fontWeight: 600,
                borderRadius: 12,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Post a Job
            </Button>
            <Button
              size="large"
              href="/jobs"
              style={{
                borderColor: 'white',
                borderWidth: 2,
                color: 'white',
                height: 56,
                padding: '0 32px',
                fontSize: '1.125rem',
                fontWeight: 600,
                borderRadius: 12,
                background: 'transparent',
              }}
            >
              Find Talent
            </Button>
          </Space>

          <Row gutter={[48, 32]} justify="center">
            {[
              { icon: <CheckCircleOutlined />, text: 'Quality Matches' },
              { icon: <SafetyOutlined />, text: 'Secure Payments' },
              { icon: <CustomerServiceOutlined />, text: '24/7 Support' },
            ].map((feature, index) => (
              <Col key={index} span={24} sm={{ span: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 32, color: 'white' }}>{feature.icon}</div>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '16px', fontWeight: 500 }}>
                    {feature.text}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}
