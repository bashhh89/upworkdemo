'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Copy, ArrowLeft, Check, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
// Add this to the component function
const { toast } = useToast();
