'use client';

import { ReactNode } from 'react';
import { Spin } from 'antd';
import { useLazyLoad } from '@/hooks/useLazyLoad';

interface LazySectionProps {
  children: ReactNode;
  minHeight?: number;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Lazy loaded section wrapper component
 * Only renders children when the section comes into view
 */
export function LazySection({ 
  children, 
  minHeight = 400,
  threshold = 0.1,
  rootMargin = '50px'
}: LazySectionProps) {
  const { ref, isVisible } = useLazyLoad({ threshold, rootMargin });

  return (
    <div ref={ref}>
      {isVisible ? (
        children
      ) : (
        <div 
          style={{ 
            minHeight, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#fafafa'
          }}
        >
          <Spin size="large" />
        </div>
      )}
    </div>
  );
}

