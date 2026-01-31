/**
 * Send Notifications Job
 * Notifies users of new testimonials, build status, etc.
 */

import type { Job } from 'bull';
import { NotifyJobData } from '../lib/queue';
import { supabase } from '../lib/supabase';

// Email service (Resend, SendGrid, etc.)
const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'notifications@wallify.com';

// Push notification service (optional)
const PUSH_API_KEY = process.env.PUSH_API_KEY;

interface NotificationResult {
  success: boolean;
  channel: 'email' | 'push' | 'in_app';
  error?: string;
}

/**
 * Process a notification job
 */
export async function processNotifyJob(job: Job<NotifyJobData>): Promise<void> {
  const { organizationId, type, data } = job.data;

  console.log(`[NotifyJob] Starting job ${job.id}`, { type, organizationId });

  try {
    // Get organization and user preferences
    const { data: org, error } = await supabase
      .from('organizations')
      .select('*, profiles!organizations_owner_id_fkey(*)')
      .eq('id', organizationId)
      .single();

    if (error || !org) {
      console.warn(`[NotifyJob] Organization not found: ${organizationId}`);
      return;
    }

    // Get notification preferences
    const preferences = await getNotificationPreferences(organizationId);

    // Send notifications based on type and preferences
    const results: NotificationResult[] = [];

    switch (type) {
      case 'new_testimonials':
        if (preferences.emailOnNewTestimonials) {
          const emailResult = await sendNewTestimonialsEmail(org, data);
          results.push(emailResult);
        }
        // Always create in-app notification
        await createInAppNotification(organizationId, type, data);
        results.push({ success: true, channel: 'in_app' });
        break;

      case 'build_complete':
        if (preferences.emailOnBuildComplete) {
          const emailResult = await sendBuildCompleteEmail(org, data);
          results.push(emailResult);
        }
        await createInAppNotification(organizationId, type, data);
        results.push({ success: true, channel: 'in_app' });
        break;

      case 'scrape_error':
        // Always notify on errors
        const errorEmailResult = await sendErrorEmail(org, data);
        results.push(errorEmailResult);
        await createInAppNotification(organizationId, type, data);
        results.push({ success: true, channel: 'in_app' });
        break;

      case 'weekly_digest':
        if (preferences.weeklyDigest) {
          const digestResult = await sendWeeklyDigestEmail(org, data);
          results.push(digestResult);
        }
        break;

      default:
        console.warn(`[NotifyJob] Unknown notification type: ${type}`);
    }

    // Log results
    const successCount = results.filter((r) => r.success).length;
    console.log(`[NotifyJob] Sent ${successCount}/${results.length} notifications`);

  } catch (error) {
    console.error(`[NotifyJob] Job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Get notification preferences for an organization
 */
async function getNotificationPreferences(organizationId: string): Promise<{
  emailOnNewTestimonials: boolean;
  emailOnBuildComplete: boolean;
  weeklyDigest: boolean;
}> {
  // Default preferences
  const defaults = {
    emailOnNewTestimonials: true,
    emailOnBuildComplete: false,
    weeklyDigest: true,
  };

  try {
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (data) {
      return {
        emailOnNewTestimonials: data.email_on_new_testimonials ?? defaults.emailOnNewTestimonials,
        emailOnBuildComplete: data.email_on_build_complete ?? defaults.emailOnBuildComplete,
        weeklyDigest: data.weekly_digest ?? defaults.weeklyDigest,
      };
    }
  } catch {
    // Table might not exist
  }

  return defaults;
}

/**
 * Send email for new testimonials
 */
async function sendNewTestimonialsEmail(
  org: { name: string; profiles: { email: string; full_name?: string } },
  data: { count: number; platform: string }
): Promise<NotificationResult> {
  if (!EMAIL_API_KEY) {
    console.warn('[NotifyJob] Email API key not configured');
    return { success: false, channel: 'email', error: 'Email not configured' };
  }

  try {
    // Using Resend-like API structure
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: org.profiles.email,
        subject: `🎉 ${data.count} new testimonials from ${data.platform}`,
        html: `
          <h1>New testimonials collected!</h1>
          <p>Hi ${org.profiles.full_name || 'there'},</p>
          <p>Great news! We just collected <strong>${data.count} new testimonials</strong> from ${data.platform} for ${org.name}.</p>
          <p><a href="https://app.wallify.com/testimonials">View them now →</a></p>
          <p>- The Wallify Team</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API returned ${response.status}`);
    }

    return { success: true, channel: 'email' };

  } catch (error) {
    return {
      success: false,
      channel: 'email',
      error: error instanceof Error ? error.message : 'Email send failed',
    };
  }
}

/**
 * Send email for build complete
 */
async function sendBuildCompleteEmail(
  org: { name: string; profiles: { email: string; full_name?: string } },
  data: { url?: string; projectName?: string }
): Promise<NotificationResult> {
  if (!EMAIL_API_KEY) {
    return { success: false, channel: 'email', error: 'Email not configured' };
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: org.profiles.email,
        subject: `✅ Your testimonial site has been updated`,
        html: `
          <h1>Site updated successfully!</h1>
          <p>Hi ${org.profiles.full_name || 'there'},</p>
          <p>Your testimonial site for ${data.projectName || org.name} has been rebuilt with the latest changes.</p>
          ${data.url ? `<p><a href="${data.url}">View your site →</a></p>` : ''}
          <p>- The Wallify Team</p>
        `,
      }),
    });

    return { success: true, channel: 'email' };
  } catch (error) {
    return {
      success: false,
      channel: 'email',
      error: error instanceof Error ? error.message : 'Email send failed',
    };
  }
}

/**
 * Send email for errors
 */
async function sendErrorEmail(
  org: { name: string; profiles: { email: string; full_name?: string } },
  data: { error: string; platform?: string }
): Promise<NotificationResult> {
  if (!EMAIL_API_KEY) {
    return { success: false, channel: 'email', error: 'Email not configured' };
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: org.profiles.email,
        subject: `⚠️ Issue with your ${data.platform || 'social'} connection`,
        html: `
          <h1>We encountered an issue</h1>
          <p>Hi ${org.profiles.full_name || 'there'},</p>
          <p>We had trouble connecting to your ${data.platform || 'social'} account:</p>
          <p><em>${data.error}</em></p>
          <p>You may need to reconnect your account.</p>
          <p><a href="https://app.wallify.com/connections">Manage connections →</a></p>
          <p>- The Wallify Team</p>
        `,
      }),
    });

    return { success: true, channel: 'email' };
  } catch (error) {
    return {
      success: false,
      channel: 'email',
      error: error instanceof Error ? error.message : 'Email send failed',
    };
  }
}

/**
 * Send weekly digest email
 */
async function sendWeeklyDigestEmail(
  org: { name: string; profiles: { email: string; full_name?: string } },
  data: { newCount: number; totalCount: number; topPlatform: string }
): Promise<NotificationResult> {
  if (!EMAIL_API_KEY) {
    return { success: false, channel: 'email', error: 'Email not configured' };
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: org.profiles.email,
        subject: `📊 Your weekly Wallify digest`,
        html: `
          <h1>Weekly Digest for ${org.name}</h1>
          <p>Hi ${org.profiles.full_name || 'there'},</p>
          <h2>This week's highlights:</h2>
          <ul>
            <li><strong>${data.newCount}</strong> new testimonials collected</li>
            <li><strong>${data.totalCount}</strong> total testimonials</li>
            <li>Most active platform: <strong>${data.topPlatform}</strong></li>
          </ul>
          <p><a href="https://app.wallify.com/dashboard">View dashboard →</a></p>
          <p>- The Wallify Team</p>
        `,
      }),
    });

    return { success: true, channel: 'email' };
  } catch (error) {
    return {
      success: false,
      channel: 'email',
      error: error instanceof Error ? error.message : 'Email send failed',
    };
  }
}

/**
 * Create in-app notification
 */
async function createInAppNotification(
  organizationId: string,
  type: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      organization_id: organizationId,
      type,
      data,
      read: false,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Table might not exist yet
    console.warn('[NotifyJob] Could not create in-app notification (table may not exist)');
  }
}

export default { processNotifyJob };
