/**
 * Build API Endpoint
 * Triggers static site regeneration for a specific project
 * 
 * This endpoint is called by the scraper service when testimonials are updated.
 * In production, this would trigger a Cloudflare Pages or Vercel deploy.
 */

import type { APIRoute } from 'astro';

// Simple API key validation
const API_SECRET = import.meta.env.BUILD_API_SECRET || 'dev-secret';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Validate API key
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');

  if (apiKey !== API_SECRET && authHeader !== `Bearer ${API_SECRET}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { projectId, projectName } = body;

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'projectId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log the build trigger
    console.log(`[Build API] Triggered for project: ${projectName || projectId}`);

    // In production, this would:
    // 1. Trigger Cloudflare Pages rebuild via API
    // 2. Or trigger Vercel deploy hook
    // 3. Or run `astro build` with specific project config

    // For now, return success (Astro's static build handles regeneration)
    const buildId = `build-${Date.now()}`;

    return new Response(
      JSON.stringify({
        success: true,
        buildId,
        message: `Build queued for ${projectName || projectId}`,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[Build API] Error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Build failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ 
      status: 'ok',
      service: 'Wallify Site Builder',
      version: '1.0.0',
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
};
