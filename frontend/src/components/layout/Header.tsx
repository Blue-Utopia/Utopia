'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Layout, Menu, Button, Avatar, Badge, Dropdown, Space, Typography, Skeleton } from 'antd';
import type { MenuProps } from 'antd';
import { 
  BellOutlined, 
  MailOutlined, 
  MessageOutlined,
  SettingOutlined, 
  LogoutOutlined, 
  UserOutlined,
  SearchOutlined,
  CrownOutlined,
  QuestionCircleOutlined,
  GlobalOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export function Header() {
  const { isConnected } = useAccount();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHomePage = pathname === '/';

  const getUserDisplayName = () => {
    return user?.displayName || user?.username || user?.email?.split('@')[0] || 'User';
  };

  const getProfilePath = () => {
    if (!user?.role) return '/profile/settings';
    if (user.role === 'CLIENT') return '/profile/client';
    if (user.role === 'DEVELOPER') return '/profile/developer';
    return '/profile/settings'; // Default for BOTH or unknown
  };

  const getDashboardPath = () => {
    if (!user?.role) return '/client'; // Default to client dashboard
    if (user.role === 'CLIENT') return '/client';
    if (user.role === 'DEVELOPER') return '/developer';
    return '/client'; // Default fallback
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      type: 'group',
      label: (
        <Link href={getProfilePath()} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              src={user?.avatar}
              size={48}
              style={{
                backgroundColor: '#14A800',
                flexShrink: 0,
              }}
            >
              {!user?.avatar && getUserDisplayName().charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ display: 'block', fontSize: '15px', lineHeight: 1.4 }}>
                {getUserDisplayName()}
              </Text>
              <Text type="secondary" style={{ fontSize: '13px', lineHeight: 1.4 }}>
                {user?.email || 'View profile'}
              </Text>
            </div>
          </div>
        </Link>
      ),
    },
    { type: 'divider' },
    {
      key: 'dashboard',
      label: (
        <Link href={getDashboardPath()} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <DashboardOutlined />
          <span>Dashboard</span>
        </Link>
      ),
    },
    {
      key: 'premium',
      label: (
        <Link href="/premium" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CrownOutlined style={{ color: '#faad14' }} />
          <span>Try Premium</span>
        </Link>
      ),
    },
    {
      key: 'profile',
      label: (
        <Link href="/profile/settings" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined />
          <span>Settings & Privacy</span>
        </Link>
      ),
    },
    {
      key: 'help',
      label: (
        <Link href="/help" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <QuestionCircleOutlined />
          <span>Help</span>
        </Link>
      ),
    },
    {
      key: 'language',
      label: (
        <Link href="/language" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <GlobalOutlined />
          <span>Language</span>
        </Link>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <div onClick={handleLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
          <LogoutOutlined />
          <span>Sign Out</span>
        </div>
      ),
    },
  ];

  return (
    <AntHeader
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        background: isHomePage ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
        borderBottom: isHomePage ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #f0f0f0',
        boxShadow: isHomePage ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 0 0 rgba(0, 0, 0, 0.05)',
        height: 72,
        backdropFilter: isHomePage ? 'blur(12px)' : 'blur(8px)',
        backgroundColor: isHomePage ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      }}
    >
          {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
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
            boxShadow: '0 2px 4px rgba(20, 168, 0, 0.15)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(20, 168, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(20, 168, 0, 0.15)';
          }}
        >
              DFM
            </div>
        <Text
          strong
          className="header-title"
          style={{
            fontSize: '1.125rem',
            color: isHomePage ? 'white' : '#1a1a1a',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          WorkFlow
        </Text>
          </Link>

          {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Menu
          mode="horizontal"
          className="header-menu"
          style={{
            border: 'none',
            background: 'transparent',
            minWidth: 400,
            fontWeight: 500,
          }}
          theme={isHomePage ? 'dark' : 'light'}
          items={[
            {
              key: 'jobs',
              label: <Link href="/jobs" style={{ textDecoration: 'none', color: 'inherit' }}>Find Work</Link>,
            },
            {
              key: 'find-talent',
              label: <Link href="/jobs" style={{ textDecoration: 'none', color: 'inherit' }}>Find Talent</Link>,
            },
            {
              key: 'post-job',
              label: <Link href="/post-job" style={{ textDecoration: 'none', color: 'inherit' }}>Post a Job</Link>,
            },
          ]}
        />

        {mounted && isConnected && (
          <Space size={8} style={{ marginLeft: 8 }}>
            <Badge count={0} showZero={false}>
              <Button
                type="text"
                icon={<MessageOutlined style={{ fontSize: 18 }} />}
                href="/messages"
                style={{
                  color: isHomePage ? 'rgba(255, 255, 255, 0.9)' : '#6b7280',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                }}
              />
            </Badge>
            <Badge count={0} showZero={false}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                href="/notifications"
                style={{
                  color: isHomePage ? 'rgba(255, 255, 255, 0.9)' : '#6b7280',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                }}
              />
            </Badge>
          </Space>
        )}

        {/* Auth Section */}
        {!mounted || authLoading ? (
          <Skeleton.Avatar active size={40} />
        ) : isAuthenticated ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
            styles={{ root: { minWidth: 240 } }}
          >
            <div
              style={{
                cursor: 'pointer',
                display: 'inline-block',
                borderRadius: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Avatar
                src={user?.avatar}
                size={40}
                style={{
                  backgroundColor: '#14A800',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.2s ease',
                }}
              >
                {!user?.avatar && getUserDisplayName().charAt(0).toUpperCase()}
              </Avatar>
          </div>
          </Dropdown>
        ) : (
          <Space size={12}>
            <Button
              type="text"
              href="/signin"
              style={{
                fontWeight: 500,
                color: '#6b7280',
                height: 40,
                padding: '0 16px',
              }}
            >
              Sign In
            </Button>
            <Button
              type="primary"
              href="/signup"
              style={{
                borderRadius: 8,
                fontWeight: 600,
                height: 40,
                padding: '0 20px',
                boxShadow: '0 2px 4px rgba(20, 168, 0, 0.15)',
              }}
            >
              Sign Up
            </Button>
          </Space>
        )}
        </div>
    </AntHeader>
  );
}
