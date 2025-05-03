'use client';

import { useEffect, useState } from 'react';
import HomeNavButton from './HomeNavButton';

export default function HomeNavWrapper() {
  const [mounted, setMounted] = useState(false);
  
  // Only show the component after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <HomeNavButton />;
} 