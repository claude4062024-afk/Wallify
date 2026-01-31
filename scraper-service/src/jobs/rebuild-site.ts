/**
 * Rebuild Site Job
 * Triggers static site regeneration when testimonials are updated
 */

import type { Job } from 'bull';
import axios from 'axios';
import { RebuildJobData } from '../lib/queue';
import { supabase } from '../lib/supabase';

// Site builder service URL (Astro build server)
const SITE_BUILDER_URL = process.env.SITE_BUILDER_URL || 'http://localhost:4321';

// Cloudflare Pages deploy hook (if using Cloudflare)
const CLOUDFLARE_DEPLOY_HOOK = process.env.CLOUDFLARE_DEPLOY_HOOK;

// Vercel deploy hook (if using Vercel)
const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;

interface BuildResult {
  success: boolean;
  buildId?: string;
  url?: string;
  error?: string;
}

/**
 * Process a rebuild job for a specific project
 */
export async function processRebuildJob(job: Job<RebuildJobData>): Promise<void> {
  const { projectId, organizationId, trigger } = job.data;

  console.log(`[RebuildJob] Starting job ${job.id}`, { projectId, trigger });

  try {
    // Get project/site configuration
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, site_settings(*)')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    console.log(`[RebuildJob] Building site for project: ${project.name}`);

    // Determine deployment target
    let result: BuildResult;

    if (CLOUDFLARE_DEPLOY_HOOK) {
      result = await triggerCloudflareBuild(project);
    } else if (VERCEL_DEPLOY_HOOK) {
      result = await triggerVercelBuild(project);
    } else {
      result = await triggerLocalBuild(project);
    }

    if (result.success) {
      console.log(`[RebuildJob] Build successful`, { buildId: result.buildId, url: result.url });

      // Update project with last build time
      await supabase
        .from('projects')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      // Record build in history (if table exists)
      await supabase
        .from('site_builds')
        .insert({
          project_id: projectId,
          organization_id: organizationId,
          status: 'success',
          build_id: result.buildId,
          url: result.url,
          trigger,
        })
        .catch(() => {
          // Table might not exist yet
        });

    } else {
      throw new Error(result.error || 'Build failed');
    }

  } catch (error) {
    console.error(`[RebuildJob] Job ${job.id} failed:`, error);

    // Record failed build
    await supabase
      .from('site_builds')
      .insert({
        project_id: projectId,
        organization_id: organizationId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        trigger,
      })
      .catch(() => {});

    throw error;
  }
}

/**
 * Trigger Cloudflare Pages build via deploy hook
 */
async function triggerCloudflareBuild(project: { id: string; name: string }): Promise<BuildResult> {
  if (!CLOUDFLARE_DEPLOY_HOOK) {
    return { success: false, error: 'Cloudflare deploy hook not configured' };
  }

  try {
    const response = await axios.post(CLOUDFLARE_DEPLOY_HOOK, null, {
      timeout: 30000,
    });

    return {
      success: true,
      buildId: response.data?.result?.id || 'unknown',
      url: response.data?.result?.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cloudflare build failed',
    };
  }
}

/**
 * Trigger Vercel build via deploy hook
 */
async function triggerVercelBuild(project: { id: string; name: string }): Promise<BuildResult> {
  if (!VERCEL_DEPLOY_HOOK) {
    return { success: false, error: 'Vercel deploy hook not configured' };
  }

  try {
    const response = await axios.post(VERCEL_DEPLOY_HOOK, null, {
      timeout: 30000,
    });

    return {
      success: true,
      buildId: response.data?.job?.id || 'unknown',
      url: response.data?.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Vercel build failed',
    };
  }
}

/**
 * Trigger local Astro build (for development)
 */
async function triggerLocalBuild(project: { id: string; name: string }): Promise<BuildResult> {
  try {
    const response = await axios.post(
      `${SITE_BUILDER_URL}/api/build`,
      {
        projectId: project.id,
        projectName: project.name,
      },
      {
        timeout: 120000, // 2 minutes for build
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: response.data?.success ?? true,
      buildId: response.data?.buildId || `local-${Date.now()}`,
      url: response.data?.url,
    };
  } catch (error) {
    // If site builder isn't running, log and continue
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      console.warn('[RebuildJob] Site builder not running, skipping build');
      return {
        success: true,
        buildId: 'skipped',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Local build failed',
    };
  }
}

/**
 * Check if a rebuild is needed (optimization)
 * Only rebuild if there are new approved testimonials since last build
 */
export async function shouldRebuild(projectId: string): Promise<boolean> {
  const { data: project } = await supabase
    .from('projects')
    .select('updated_at')
    .eq('id', projectId)
    .single();

  if (!project) return false;

  const { count } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('status', 'approved')
    .gt('updated_at', project.updated_at || '1970-01-01');

  return (count || 0) > 0;
}

export default { processRebuildJob, shouldRebuild };
