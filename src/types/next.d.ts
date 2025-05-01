// Type declarations to make Next.js 15.3.1 route handlers happy
import { NextResponse } from 'next/server';

declare global {
  // Allow any type for route handler context parameter
  type NextRouteContext = any;

  // Augment Next.js types to be more flexible
  namespace NextApiResponse {
    interface NextRequest extends Request {}
  }
}

export { NextResponse }; 