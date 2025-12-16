'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Layout, Card, Form, Input, Button, Typography, Divider, Space, Spin } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

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
  }) => {
    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(values.email, values.password, values.username, values.displayName);
      router.push('/');
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
            maxWidth: 440,
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
