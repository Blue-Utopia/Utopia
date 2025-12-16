'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Layout, Typography, Card, Form, Input, Select, Button, Row, Col, Alert, InputNumber, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function PostJobPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet and authenticate');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Submit to GraphQL API
      console.log('Submitting job:', values);

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
    <Layout style={{ minHeight: '100vh', background: '#F7F7F7' }}>
      <Content style={{ padding: '40px 24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8, fontWeight: 700, color: '#222222' }}>
            Post a Job
          </Title>
          <Paragraph style={{ fontSize: '1.125rem', color: '#6B6B6B', margin: 0 }}>
            Find the perfect freelancer for your project.
          </Paragraph>
        </div>

        <Card style={{ borderRadius: 12, border: '1px solid #EEEEEE' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              category: 'development',
              currency: 'USDC',
            }}
          >
            {/* Title */}
            <Form.Item
              name="title"
              label="Job Title"
              rules={[{ required: true, message: 'Please enter a job title' }]}
            >
              <Input
                size="large"
                placeholder="e.g., Full Stack Developer for DeFi Project"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            {/* Description */}
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter a description' }]}
            >
              <TextArea
                rows={6}
                placeholder="Describe your project in detail..."
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            {/* Category */}
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select size="large" style={{ borderRadius: 8 }}>
                <Option value="development">Development</Option>
                <Option value="design">Design</Option>
                <Option value="security">Security</Option>
                <Option value="marketing">Marketing</Option>
                <Option value="writing">Writing</Option>
              </Select>
            </Form.Item>

            {/* Budget and Currency */}
            <Row gutter={16}>
              <Col span={24} sm={{ span: 12 }}>
                <Form.Item
                  name="budget"
                  label="Budget (USD)"
                  rules={[{ required: true, message: 'Please enter a budget' }]}
                >
                  <InputNumber
                    size="large"
                    min={1}
                    placeholder="5000"
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={24} sm={{ span: 12 }}>
                <Form.Item
                  name="currency"
                  label="Payment Currency"
                  rules={[{ required: true, message: 'Please select a currency' }]}
                >
                  <Select size="large" style={{ borderRadius: 8 }}>
                    <Option value="USDC">USDC</Option>
                    <Option value="USDT">USDT</Option>
                    <Option value="ETH">ETH</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Duration and Deadline */}
            <Row gutter={16}>
              <Col span={24} sm={{ span: 12 }}>
                <Form.Item
                  name="estimatedDuration"
                  label="Estimated Duration (days)"
                >
                  <InputNumber
                    size="large"
                    min={1}
                    placeholder="30"
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={24} sm={{ span: 12 }}>
                <Form.Item
                  name="deadline"
                  label="Deadline"
                >
                  <DatePicker
                    size="large"
                    style={{ width: '100%', borderRadius: 8 }}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Required Skills */}
            <Form.Item
              name="requiredSkills"
              label="Required Skills"
              rules={[{ required: true, message: 'Please enter required skills' }]}
              extra="Separate skills with commas"
            >
              <Input
                size="large"
                placeholder="React, Node.js, Solidity (comma separated)"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            {/* Tags */}
            <Form.Item
              name="tags"
              label="Tags"
            >
              <Input
                size="large"
                placeholder="web3, defi, frontend (comma separated)"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            {/* Info */}
            <Alert
              message="Note"
              description="After posting, you'll need to deposit 50% of the budget into escrow before work can begin."
              type="info"
              showIcon
              style={{ marginBottom: 24, borderRadius: 8 }}
            />

            {/* Submit Button */}
            <Form.Item>
              <Row gutter={16}>
                <Col span={24} sm={{ span: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={isSubmitting}
                    block
                    style={{
                      borderRadius: 8,
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      height: 48,
                    }}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Job'}
                  </Button>
                </Col>
                <Col span={24} sm={{ span: 8 }}>
                  <Button
                    size="large"
                    block
                    onClick={() => router.back()}
                    style={{
                      borderRadius: 8,
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      height: 48,
                    }}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
