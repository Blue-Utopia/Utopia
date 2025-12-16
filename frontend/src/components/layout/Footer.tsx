'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Typography, Row, Col, Space } from 'antd';
import { GithubOutlined, TwitterOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <footer
      style={{
        background: '#1e293b',
        color: 'white',
        padding: '64px 24px 32px',
        marginTop: 0,
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Row gutter={[48, 48]}>
          {/* About */}
          <Col span={24} lg={{ span: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #14A800 0%, #5CB615 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  padding: '6px 14px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 48,
                  height: 36,
                }}
              >
                WF
              </div>
              <Text strong style={{ color: 'white', fontSize: '1.125rem', fontWeight: 600 }}>
                WorkFlow
              </Text>
            </div>
            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7, display: 'block', fontSize: '14px' }}>
              Connect with top talent and find amazing projects. Build your career with us.
            </Text>
          </Col>

          {/* For Clients */}
          <Col span={24} sm={{ span: 12 }} lg={{ span: 6 }}>
            <Title level={5} style={{ color: 'white', marginBottom: 20, fontWeight: 600 }}>
              For Clients
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {[
                { href: '/jobs', label: 'Find Talent' },
                { href: '/post-job', label: 'Post a Job' },
                { href: '/enterprise', label: 'Enterprise' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    display: 'block',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#14A800')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
                >
                  {item.label}
                </Link>
              ))}
            </Space>
          </Col>

          {/* For Freelancers */}
          <Col span={24} sm={{ span: 12 }} lg={{ span: 6 }}>
            <Title level={5} style={{ color: 'white', marginBottom: 20, fontWeight: 600 }}>
              For Freelancers
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {[
                { href: '/jobs', label: 'Find Work' },
                { href: '/resources', label: 'Resources' },
                { href: '/community', label: 'Community' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    display: 'block',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#14A800')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
                >
                  {item.label}
                </Link>
              ))}
            </Space>
          </Col>

          {/* Company */}
          <Col span={24} sm={{ span: 12 }} lg={{ span: 6 }}>
            <Title level={5} style={{ color: 'white', marginBottom: 20, fontWeight: 600 }}>
              Company
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {[
                { href: '/about', label: 'About Us' },
                { href: '/careers', label: 'Careers' },
                { href: '/contact', label: 'Contact' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    display: 'block',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#14A800')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
                >
                  {item.label}
                </Link>
              ))}
            </Space>
          </Col>
        </Row>

        {/* Copyright & Links */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: 48,
            paddingTop: 32,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
            © 2024 WorkFlow. All rights reserved.
          </Text>
          <Space size={24}>
            <Link
              href="/terms"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#14A800')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#14A800')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#14A800')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
            >
              Cookies
            </Link>
          </Space>
        </div>
      </div>
    </footer>
  );
}
