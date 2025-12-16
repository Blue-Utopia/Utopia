'use client';

import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { AuthProvider } from '@/contexts/AuthContext';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';

const config = getDefaultConfig({
  appName: 'Decentralized Freelance Marketplace',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
});

// Modern, clean theme configuration
const antdTheme = {
  token: {
    colorPrimary: '#14A800', // Upwork green
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1F57C3',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    lineHeight: 1.5715,
    // Modern color palette
    colorText: '#1a1a1a',
    colorTextSecondary: '#6b7280',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#fafafa',
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f3f4f6',
    // Better shadows
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 600,
      controlHeight: 40,
      boxShadow: 'none',
      primaryShadow: '0 2px 0 rgba(0, 0, 0, 0.02)',
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
      paddingLG: 24,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 12,
      hoverBorderColor: '#14A800',
      activeBorderColor: '#14A800',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Layout: {
      bodyBg: '#fafafa',
      headerBg: '#ffffff',
      headerHeight: 72,
      headerPadding: '0 32px',
    },
    Menu: {
      itemBorderRadius: 6,
      itemHoverBg: '#f5f5f5',
      itemSelectedBg: '#f0fdf4',
      itemSelectedColor: '#14A800',
      itemActiveBg: '#f0fdf4',
    },
    Avatar: {
      borderRadius: 8,
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component to avoid SSR issues
  // Using useState with lazy initialization ensures it's only created once
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ConfigProvider theme={antdTheme}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ApolloProvider client={apolloClient}>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ApolloProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ConfigProvider>
  );
}

