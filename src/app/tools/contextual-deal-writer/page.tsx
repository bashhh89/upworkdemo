import { Metadata } from 'next';
import ContextualDealWriter from '@/app/components/ContextualDealWriter';

export const metadata: Metadata = {
  title: 'Contextual Deal Writer | Ahmad.Ai',
  description: 'Generate personalized business proposals with AI-powered analysis of prospect websites and executives',
};

export default function ContextualDealWriterPage() {
  return <ContextualDealWriter />;
} 