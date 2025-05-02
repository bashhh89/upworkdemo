// This file is a shim for the Buffer class to be available in the browser
// It's used by various dependencies that require Node.js Buffer

import { Buffer as NodeBuffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).Buffer = NodeBuffer;
}

export { NodeBuffer as Buffer }; 