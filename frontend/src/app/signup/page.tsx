'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Layout, Card, Form, Input, Button, Typography, Divider, Spin, Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, ShopOutlined, CheckCircleFilled } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SignUpPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading } = useAuth();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
    username?: string;
    displayName?: string;
    role?: 'CLIENT' | 'DEVELOPER';
  }) => {
    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!values.role) {
      toast.error('Please select your role');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(values.email, values.password, values.username, values.displayName, values.role);
      // Redirect based on role
      if (values.role === 'CLIENT') {
        router.push('/client');
      } else {
        router.push('/developer');
      }
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#F7F7F7' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#F7F7F7' }}>
      <style jsx global>{`
        .role-selection-group .ant-radio-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        
        .role-option-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          border: 2px solid #E5E7EB !important;
          border-radius: 12px !important;
          background: #FFFFFF !important;
          padding: 24px !important;
          height: auto !important;
          line-height: normal !important;
          margin: 0 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        }
        
        .role-option-card::before {
          display: none !important;
        }
        
        .role-option-card .ant-radio-button {
          display: none;
        }
        
        .role-option-card:hover:not(.ant-radio-button-wrapper-checked) {
          border-color: #D1D5DB !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          transform: translateY(-1px);
        }
        
        .role-option-card.ant-radio-button-wrapper-checked {
          border-color: #14A800 !important;
          border-width: 3px !important;
          background: linear-gradient(135deg, #F0FDF4 0%, #E6F7ED 100%) !important;
          box-shadow: 0 6px 20px rgba(20, 168, 0, 0.2) !important;
          transform: translateY(-2px);
        }
        
        .role-option-card.ant-radio-button-wrapper-checked .checkmark-badge {
          opacity: 1 !important;
          transform: scale(1);
        }
        
        .role-option-card.ant-radio-button-wrapper-checked .icon-container {
          background: #14A800 !important;
          box-shadow: 0 4px 12px rgba(20, 168, 0, 0.3) !important;
        }
        
        .role-option-card.ant-radio-button-wrapper-checked .icon-container svg {
          color: #FFFFFF !important;
        }
        
        .role-option-card.ant-radio-button-wrapper-checked .role-title {
          color: #14A800 !important;
          font-weight: 700 !important;
        }
        
        .checkmark-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: #14A800;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(20, 168, 0, 0.3);
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .icon-container {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .role-option-card:not(.ant-radio-button-wrapper-checked) .icon-container {
          background: #F3F4F6;
        }
        
        .role-option-card:not(.ant-radio-button-wrapper-checked) .icon-container svg {
          color: #6B7280;
        }
        
        .role-content {
          flex: 1;
          min-width: 0;
        }
        
        .role-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
          transition: color 0.3s ease;
        }
        
        .role-description {
          font-size: 0.875rem;
          color: #6B7280;
          line-height: 1.5;
        }
      `}</style>
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 500,
            borderRadius: 12,
            border: '1px solid #EEEEEE',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={2} style={{ marginBottom: 8, fontWeight: 700 }}>
              Sign Up
            </Title>
            <Text type="secondary">Create your account to get started.</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[{ min: 3, message: 'Username must be at least 3 characters' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username (optional)"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item name="displayName">
              <Input
                prefix={<UserOutlined />}
                placeholder="Display Name (optional)"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="role"
              label={
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: 12, display: 'block' }}>
                  I want to
                </span>
              }
              rules={[{ required: true, message: 'Please select your role' }]}
              className="role-selection-group"
            >
              <Radio.Group style={{ width: '100%' }}>
                <Radio.Button value="CLIENT" className="role-option-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', position: 'relative' }}>
                    <div className="icon-container">
                      <ShopOutlined style={{ fontSize: 32 }} />
                    </div>
                    <div className="role-content">
                      <div className="role-title">Hire Freelancers</div>
                      <div className="role-description">Post jobs and find talented freelancers</div>
                    </div>
                    <div className="checkmark-badge">
                      <CheckCircleFilled style={{ fontSize: 18, color: '#FFFFFF' }} />
                    </div>
                  </div>
                </Radio.Button>
                <Radio.Button value="DEVELOPER" className="role-option-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', position: 'relative' }}>
                    <div className="icon-container">
                      <TeamOutlined style={{ fontSize: 32 }} />
                    </div>
                    <div className="role-content">
                      <div className="role-title">Work as a Freelancer</div>
                      <div className="role-description">Find jobs and get hired by clients</div>
                    </div>
                    <div className="checkmark-badge">
                      <CheckCircleFilled style={{ fontSize: 18, color: '#FFFFFF' }} />
                    </div>
                  </div>
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSubmitting}
                style={{
                  borderRadius: 8,
                  height: 48,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>

          <Divider>Or</Divider>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Already have an account?{' '}
              <Link href="/signin" style={{ color: '#14A800', fontWeight: 600 }}>
                Sign In
              </Link>
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
