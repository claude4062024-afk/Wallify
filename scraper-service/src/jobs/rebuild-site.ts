/**
 * Rebuild Site Job
 * Triggers GitHub Actions workflow to build and deploy customer sites
 * 
 * Following Soul.md:
 * - Build time < 30 seconds per site
 * - User sees updated page < 2 minutes from approval
 * 
 * Architecture:
 * - Scraper Service triggers GitHub Actions via workflow_dispatch
 * - GitHub Actions runs isolated build (BUILD_PROJECT_ID)
 * - Cloudflare Pages deploys the static site
 */

import type { Job } from 'bull';
import axios from 'axios';
import { RebuildJobData } from '../lib/queue';
import { supabase } from '../lib/supabase';

// GitHub configuration
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Kimenzo';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Wallify';
const GITHUB_WORKFLOW = 'deploy-tenant.yml';

// GitHub Actions API endpoint
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW}/dispatches`;

interface BuildResult {
  success: boolean;
  message: string;
  workflowTriggered?: boolean;
}

/**
 * Process a rebuild job for a specific project
 * Triggers GitHub Actions to build and deploy the site
 */
export async function processRebuildJob(job: Job<RebuildJobData>): Promise<void> {
  const { projectId, organizationId, trigger } = job.data;

  console.log(`[RebuildJob] Starting job ${job.id} - rebuild-site.ts:42`, { projectId, trigger });

  try {
    // Validate GitHub PAT is configured
    if (!GITHUB_PAT) {
      throw new Error('GITHUB_PAT environment variable not configured');
    }

    // Get project details for logging
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    console.log(`[RebuildJob] Triggering GitHub Actions for project: ${project.name} (${projectId}) - rebuild-site.ts:61`);

    // Trigger GitHub Actions workflow
    const result = await triggerGitHubWorkflow(projectId);

    if (result.success) {
      console.log(`[RebuildJob] ✅ GitHub workflow triggered successfully - rebuild-site.ts:67`, {
        projectId,
        projectName: project.name,
      });

      // Update project with last build trigger time
      await supabase
        .from('projects')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      // Record build in history
      await supabase
        .from('site_builds')
        .insert({
          project_id: projectId,
          organization_id: organizationId,
          status: 'queued',
          trigger,
          metadata: {
            github_workflow: GITHUB_WORKFLOW,
            triggered_at: new Date().toISOString(),
          },
        })
        .catch(() => {
          // Table might not exist yet
          console.warn('[RebuildJob] site_builds table not found, skipping history - rebuild-site.ts:95');
        });

    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error(`[RebuildJob] ❌ Job ${job.id} failed: - rebuild-site.ts:103`, error);

    // Record failed build attempt
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
 * Trigger GitHub Actions workflow via workflow_dispatch
 * 
 * API: POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches
 * Docs: https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event
 */
async function triggerGitHubWorkflow(projectId: string): Promise<BuildResult> {
  if (!GITHUB_PAT) {
    return {
      success: false,
      message: 'GITHUB_PAT not configured',
      workflowTriggered: false,
    };
  }

  try {
    console.log(`[RebuildJob] Calling GitHub API: ${GITHUB_API_URL} - rebuild-site.ts:137`);

    const response = await axios.post(
      GITHUB_API_URL,
      {
        ref: 'main',
        inputs: {
          project_id: projectId,
          environment: 'production',
        },
      },
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${GITHUB_PAT}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // GitHub returns 204 No Content on success
    if (response.status === 204) {
      console.log(`[RebuildJob] GitHub workflow dispatch successful (204 No Content) - rebuild-site.ts:161`);
      return {
        success: true,
        message: 'Workflow triggered successfully',
        workflowTriggered: true,
      };
    }

    // Unexpected success status
    console.log(`[RebuildJob] GitHub response: ${response.status} - rebuild-site.ts:170`, response.data);
    return {
      success: true,
      message: `Workflow triggered with status ${response.status}`,
      workflowTriggered: true,
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      console.error(`[RebuildJob] GitHub API error: - rebuild-site.ts:182`, {
        status,
        message,
        url: GITHUB_API_URL,
      });

      // Specific error handling
      if (status === 401) {
        return {
          success: false,
          message: 'GitHub PAT is invalid or expired',
          workflowTriggered: false,
        };
      }

      if (status === 403) {
        return {
          success: false,
          message: 'GitHub PAT lacks workflow permissions. Ensure "workflow" scope is enabled.',
          workflowTriggered: false,
        };
      }

      if (status === 404) {
        return {
          success: false,
          message: `Workflow not found: ${GITHUB_WORKFLOW}. Check repo and workflow file exist.`,
          workflowTriggered: false,
        };
      }

      if (status === 422) {
        return {
          success: false,
          message: `Invalid workflow inputs: ${message}`,
          workflowTriggered: false,
        };
      }

      return {
        success: false,
        message: `GitHub API error (${status}): ${message}`,
        workflowTriggered: false,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error triggering workflow',
      workflowTriggered: false,
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

/**
 * Manually trigger a rebuild (for API endpoints)
 */
export async function triggerRebuild(
  projectId: string,
  organizationId: string,
  trigger: string = 'manual'
): Promise<BuildResult> {
  console.log(`[RebuildJob] Manual trigger for project: ${projectId} - rebuild-site.ts:267`);

  if (!GITHUB_PAT) {
    return {
      success: false,
      message: 'GITHUB_PAT not configured. Set it in environment variables.',
    };
  }

  return triggerGitHubWorkflow(projectId);
}

export default { processRebuildJob, shouldRebuild, triggerRebuild };
