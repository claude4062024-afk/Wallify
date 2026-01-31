/**
 * Health Check API
 * Simple endpoint for monitoring
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ 
      status: 'healthy',
      service: 'Wallify Site Builder',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
};
