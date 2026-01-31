/**
 * Wallify Widget Embed Script
 * 
 * This script allows customers to embed testimonial widgets on their websites.
 * Following Skill.md standards for widget embeds.
 * 
 * Usage:
 * <script src="https://cdn.wallify.io/widget.js" data-widget-id="YOUR_WIDGET_ID"></script>
 * 
 * Or programmatically:
 * Wallify.init({ widgetId: 'YOUR_WIDGET_ID', containerId: 'my-container' });
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE = 'https://wallify.supabase.co/functions/v1';
  const DEFAULT_STYLES = {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  // Widget state
  const widgets = new Map();

  /**
   * Initialize Wallify widget
   */
  function init(options) {
    const { widgetId, containerId } = options;

    if (!widgetId) {
      console.error('[Wallify] Widget ID is required');
      return;
    }

    const container = containerId 
      ? document.getElementById(containerId) 
      : findScriptContainer();

    if (!container) {
      console.error('[Wallify] Container not found');
      return;
    }

    loadWidget(widgetId, container);
  }

  /**
   * Find container from script tag
   */
  function findScriptContainer() {
    const scripts = document.querySelectorAll('script[data-widget-id]');
    for (const script of scripts) {
      const widgetId = script.getAttribute('data-widget-id');
      if (widgetId && !widgets.has(widgetId)) {
        // Create container after script
        const container = document.createElement('div');
        container.id = `wallify-widget-${widgetId}`;
        script.parentNode.insertBefore(container, script.nextSibling);
        return container;
      }
    }
    return null;
  }

  /**
   * Load widget data and render
   */
  async function loadWidget(widgetId, container) {
    if (widgets.has(widgetId)) {
      console.warn('[Wallify] Widget already initialized:', widgetId);
      return;
    }

    widgets.set(widgetId, { container, loading: true });
    container.innerHTML = renderLoading();

    try {
      // Fetch widget configuration and testimonials
      const response = await fetch(`${API_BASE}/get-widget?id=${widgetId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load widget');
      }

      const data = await response.json();
      widgets.set(widgetId, { ...widgets.get(widgetId), data, loading: false });

      // Track impression
      trackEvent(widgetId, 'impression');

      // Render widget
      render(widgetId, container, data);
    } catch (error) {
      console.error('[Wallify] Error loading widget:', error);
      container.innerHTML = renderError();
      widgets.set(widgetId, { ...widgets.get(widgetId), error: true, loading: false });
    }
  }

  /**
   * Render widget based on type
   */
  function render(widgetId, container, data) {
    const { widget, testimonials } = data;
    const config = widget.config || {};

    if (!testimonials || testimonials.length === 0) {
      container.innerHTML = renderEmpty();
      return;
    }

    container.innerHTML = '';
    container.appendChild(createWidgetElement(widgetId, widget, testimonials, config));
  }

  /**
   * Create widget DOM element based on type
   */
  function createWidgetElement(widgetId, widget, testimonials, config) {
    const wrapper = document.createElement('div');
    wrapper.className = 'wallify-widget';
    wrapper.style.cssText = getWrapperStyles(config);

    switch (widget.type) {
      case 'grid':
        wrapper.appendChild(renderGrid(widgetId, testimonials, config));
        break;
      case 'carousel':
        wrapper.appendChild(renderCarousel(widgetId, testimonials, config));
        break;
      case 'ticker':
        wrapper.appendChild(renderTicker(widgetId, testimonials, config));
        break;
      case 'story':
        wrapper.appendChild(renderStory(widgetId, testimonials, config));
        break;
      case 'feed':
        wrapper.appendChild(renderFeed(widgetId, testimonials, config));
        break;
      default:
        wrapper.appendChild(renderGrid(widgetId, testimonials, config));
    }

    return wrapper;
  }

  /**
   * Render Grid Layout
   */
  function renderGrid(widgetId, testimonials, config) {
    const grid = document.createElement('div');
    grid.className = 'wallify-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      padding: 16px 0;
    `;

    testimonials.forEach(t => {
      grid.appendChild(createTestimonialCard(widgetId, t, config));
    });

    return grid;
  }

  /**
   * Render Carousel Layout
   */
  function renderCarousel(widgetId, testimonials, config) {
    const carousel = document.createElement('div');
    carousel.className = 'wallify-carousel';
    carousel.style.cssText = `
      position: relative;
      overflow: hidden;
      padding: 16px 0;
    `;

    const track = document.createElement('div');
    track.className = 'wallify-carousel-track';
    track.style.cssText = `
      display: flex;
      gap: 24px;
      transition: transform 0.5s ease;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -ms-overflow-style: none;
    `;

    testimonials.forEach(t => {
      const slide = document.createElement('div');
      slide.style.cssText = `
        flex: 0 0 350px;
        scroll-snap-align: start;
      `;
      slide.appendChild(createTestimonialCard(widgetId, t, config));
      track.appendChild(slide);
    });

    carousel.appendChild(track);

    // Auto-scroll if enabled
    if (config.autoplay) {
      let scrollPosition = 0;
      setInterval(() => {
        scrollPosition += 374; // card width + gap
        if (scrollPosition >= track.scrollWidth - carousel.offsetWidth) {
          scrollPosition = 0;
        }
        track.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }, config.autoplayInterval || 5000);
    }

    return carousel;
  }

  /**
   * Render Ticker Layout (horizontal scrolling)
   */
  function renderTicker(widgetId, testimonials, config) {
    const ticker = document.createElement('div');
    ticker.className = 'wallify-ticker';
    ticker.style.cssText = `
      overflow: hidden;
      padding: 16px 0;
    `;

    const track = document.createElement('div');
    track.className = 'wallify-ticker-track';
    track.style.cssText = `
      display: flex;
      gap: 24px;
      animation: wallify-ticker 30s linear infinite;
    `;

    // Double the testimonials for infinite scroll effect
    [...testimonials, ...testimonials].forEach(t => {
      const card = createTestimonialCard(widgetId, t, config);
      card.style.flex = '0 0 350px';
      track.appendChild(card);
    });

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes wallify-ticker {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);

    ticker.appendChild(track);
    return ticker;
  }

  /**
   * Render Story Layout (one at a time with navigation)
   */
  function renderStory(widgetId, testimonials, config) {
    let currentIndex = 0;

    const story = document.createElement('div');
    story.className = 'wallify-story';
    story.style.cssText = `
      position: relative;
      max-width: 500px;
      margin: 0 auto;
      padding: 16px 0;
    `;

    const cardContainer = document.createElement('div');
    cardContainer.appendChild(createTestimonialCard(widgetId, testimonials[0], config));

    const nav = document.createElement('div');
    nav.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
    `;

    // Create dots for navigation
    testimonials.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: none;
        background: ${i === 0 ? '#f59e0b' : '#e5e7eb'};
        cursor: pointer;
        padding: 0;
      `;
      dot.onclick = () => {
        currentIndex = i;
        updateStory();
      };
      nav.appendChild(dot);
    });

    function updateStory() {
      cardContainer.innerHTML = '';
      cardContainer.appendChild(createTestimonialCard(widgetId, testimonials[currentIndex], config));
      nav.querySelectorAll('button').forEach((dot, i) => {
        dot.style.background = i === currentIndex ? '#f59e0b' : '#e5e7eb';
      });
    }

    // Auto-advance if enabled
    if (config.autoplay) {
      setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateStory();
      }, config.autoplayInterval || 5000);
    }

    story.appendChild(cardContainer);
    story.appendChild(nav);
    return story;
  }

  /**
   * Render Feed Layout (vertical list)
   */
  function renderFeed(widgetId, testimonials, config) {
    const feed = document.createElement('div');
    feed.className = 'wallify-feed';
    feed.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 600px;
      margin: 0 auto;
      padding: 16px 0;
    `;

    testimonials.forEach(t => {
      feed.appendChild(createTestimonialCard(widgetId, t, config));
    });

    return feed;
  }

  /**
   * Create individual testimonial card
   */
  function createTestimonialCard(widgetId, testimonial, config) {
    const card = document.createElement('div');
    card.className = 'wallify-testimonial-card';
    card.style.cssText = `
      background: ${config.cardBackground || '#ffffff'};
      border: 1px solid ${config.borderColor || '#e5e7eb'};
      border-radius: ${config.borderRadius || 12}px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.2s ease;
      cursor: pointer;
      font-family: ${DEFAULT_STYLES.fontFamily};
    `;

    card.onmouseenter = () => {
      card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    };
    card.onmouseleave = () => {
      card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    };

    card.onclick = () => {
      trackEvent(widgetId, 'click', { testimonialId: testimonial.id });
    };

    // Author section
    const author = document.createElement('div');
    author.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    `;

    // Avatar
    const avatar = document.createElement('div');
    if (testimonial.author_avatar) {
      const img = document.createElement('img');
      img.src = testimonial.author_avatar;
      img.alt = testimonial.author_name || 'Author';
      img.style.cssText = `
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
      `;
      avatar.appendChild(img);
    } else {
      avatar.innerHTML = `
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d97706;
          font-weight: 600;
          font-size: 16px;
        ">${getInitials(testimonial.author_name)}</div>
      `;
    }
    author.appendChild(avatar);

    // Author info
    const authorInfo = document.createElement('div');
    authorInfo.innerHTML = `
      <div style="font-weight: 600; color: ${config.textColor || '#111827'}; font-size: 15px;">
        ${escapeHtml(testimonial.author_name || 'Anonymous')}
      </div>
      <div style="color: ${config.mutedColor || '#6b7280'}; font-size: 13px;">
        ${escapeHtml(testimonial.author_title || 'Customer')}
        ${testimonial.author_company ? ` at ${escapeHtml(testimonial.author_company)}` : ''}
      </div>
    `;
    author.appendChild(authorInfo);
    card.appendChild(author);

    // Star rating if available
    if (testimonial.rating) {
      const stars = document.createElement('div');
      stars.style.cssText = 'margin-bottom: 12px;';
      stars.innerHTML = Array(5).fill(0).map((_, i) => `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${i < testimonial.rating ? '#fbbf24' : '#e5e7eb'}" style="display: inline-block; margin-right: 2px;">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      `).join('');
      card.appendChild(stars);
    }

    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      color: ${config.textColor || '#374151'};
      font-size: 15px;
      line-height: 1.6;
    `;
    content.textContent = `"${testimonial.content_text}"`;
    card.appendChild(content);

    // Source badge
    if (config.showSource && testimonial.source) {
      const source = document.createElement('div');
      source.style.cssText = `
        margin-top: 16px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: #f3f4f6;
        border-radius: 4px;
        font-size: 12px;
        color: #6b7280;
      `;
      source.textContent = `via ${testimonial.source}`;
      card.appendChild(source);
    }

    return card;
  }

  /**
   * Get wrapper styles based on config
   */
  function getWrapperStyles(config) {
    return `
      font-family: ${DEFAULT_STYLES.fontFamily};
      max-width: ${config.maxWidth || '100%'};
      margin: 0 auto;
    `;
  }

  /**
   * Render loading state
   */
  function renderLoading() {
    return `
      <div style="display: flex; justify-content: center; padding: 40px;">
        <div style="
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: wallify-spin 1s linear infinite;
        "></div>
        <style>
          @keyframes wallify-spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
  }

  /**
   * Render error state
   */
  function renderError() {
    return `
      <div style="
        text-align: center;
        padding: 40px;
        color: #6b7280;
        font-family: ${DEFAULT_STYLES.fontFamily};
      ">
        <p>Unable to load testimonials. Please try again later.</p>
      </div>
    `;
  }

  /**
   * Render empty state
   */
  function renderEmpty() {
    return `
      <div style="
        text-align: center;
        padding: 40px;
        color: #6b7280;
        font-family: ${DEFAULT_STYLES.fontFamily};
      ">
        <p>No testimonials to display yet.</p>
      </div>
    `;
  }

  /**
   * Track analytics event
   */
  function trackEvent(widgetId, eventType, data) {
    // Non-blocking analytics
    fetch(`${API_BASE}/track-widget-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        widget_id: widgetId,
        event_type: eventType,
        timestamp: new Date().toISOString(),
        visitor_context: {
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          ...data,
        },
      }),
    }).catch(() => {
      // Silently fail - analytics should never break the widget
    });
  }

  /**
   * Get initials from name
   */
  function getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Auto-initialize from script tags
  function autoInit() {
    const scripts = document.querySelectorAll('script[data-widget-id]');
    scripts.forEach(script => {
      const widgetId = script.getAttribute('data-widget-id');
      if (widgetId && !widgets.has(widgetId)) {
        const container = document.createElement('div');
        container.id = `wallify-widget-${widgetId}`;
        script.parentNode.insertBefore(container, script.nextSibling);
        loadWidget(widgetId, container);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // Export to global
  window.Wallify = {
    init,
    refresh: function(widgetId) {
      const widget = widgets.get(widgetId);
      if (widget) {
        loadWidget(widgetId, widget.container);
      }
    },
  };
})();
