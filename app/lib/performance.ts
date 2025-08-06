// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private isEnabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_PERFORMANCE_MONITORING === 'true';

  // Start timing an operation
  startTiming(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  // End timing an operation
  endTiming(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance: No start time found for ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log slow operations (>1000ms)
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);
    }

    return duration;
  }

  // Measure a function execution
  async measure<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    if (!this.isEnabled) {
      return await fn();
    }

    this.startTiming(name, metadata);
    try {
      const result = await fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Get metrics for a specific operation
  getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  // Clear metrics
  clear(): void {
    this.metrics.clear();
  }

  // Get performance summary
  getSummary(): {
    totalOperations: number;
    averageDuration: number;
    slowOperations: PerformanceMetrics[];
  } {
    const metrics = this.getMetrics().filter(m => m.duration !== undefined);
    const totalOperations = metrics.length;
    const averageDuration = totalOperations > 0 
      ? metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalOperations 
      : 0;
    const slowOperations = metrics.filter(m => (m.duration || 0) > 1000);

    return {
      totalOperations,
      averageDuration,
      slowOperations,
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Decorator for timing async functions
export function timed(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return await performanceMonitor.measure(
        methodName,
        () => originalMethod.apply(this, args),
        { args: args.length }
      );
    };

    return descriptor;
  };
}

// Web Vitals monitoring for client-side
export class WebVitalsMonitor {
  private static instance: WebVitalsMonitor;
  private metrics: Record<string, number> = {};

  static getInstance(): WebVitalsMonitor {
    if (!WebVitalsMonitor.instance) {
      WebVitalsMonitor.instance = new WebVitalsMonitor();
    }
    return WebVitalsMonitor.instance;
  }

  // Initialize web vitals monitoring
  init(): void {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observePerformanceEntries();
    this.setupNavigationTiming();
  }

  private observePerformanceEntries(): void {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.reportMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.reportMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private setupNavigationTiming(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // Time to First Byte (TTFB)
        const ttfb = navigation.responseStart - navigation.fetchStart;
        this.metrics.ttfb = ttfb;
        this.reportMetric('TTFB', ttfb);

        // DOM Content Loaded
        const dcl = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        this.metrics.dcl = dcl;
        this.reportMetric('DCL', dcl);

        // Full page load
        const load = navigation.loadEventEnd - navigation.fetchStart;
        this.metrics.load = load;
        this.reportMetric('Load', load);
      }
    });
  }

  private reportMetric(name: string, value: number): void {
    // In production, you would send these to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital - ${name}:`, value);
    }

    // Example: Send to analytics
    // this.sendToAnalytics(name, value);
  }

  // Get current metrics
  getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }
}

// Database query performance monitoring
export class DatabasePerformanceMonitor {
  private queryMetrics: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  // Track a database query
  trackQuery(query: string, duration: number): void {
    // Normalize query for grouping (remove values, keep structure)
    const normalizedQuery = this.normalizeQuery(query);
    
    const existing = this.queryMetrics.get(normalizedQuery) || { count: 0, totalTime: 0, avgTime: 0 };
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    
    this.queryMetrics.set(normalizedQuery, existing);

    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow database query (${duration.toFixed(2)}ms):`, query);
    }
  }

  private normalizeQuery(query: string): string {
    // Simple normalization - replace values with placeholders
    return query
      .replace(/\$\d+/g, '$?')  // Replace $1, $2, etc. with $?
      .replace(/'[^']*'/g, "'?'")  // Replace string literals
      .replace(/\b\d+\b/g, '?')    // Replace numbers
      .replace(/\s+/g, ' ')        // Normalize whitespace
      .trim();
  }

  // Get query statistics
  getQueryStats(): Array<{
    query: string;
    count: number;
    totalTime: number;
    avgTime: number;
  }> {
    return Array.from(this.queryMetrics.entries()).map(([query, stats]) => ({
      query,
      ...stats,
    })).sort((a, b) => b.totalTime - a.totalTime);
  }

  // Get slow queries
  getSlowQueries(threshold = 1000): Array<{
    query: string;
    avgTime: number;
    count: number;
  }> {
    return this.getQueryStats()
      .filter(stat => stat.avgTime > threshold)
      .sort((a, b) => b.avgTime - a.avgTime);
  }

  // Clear metrics
  clear(): void {
    this.queryMetrics.clear();
  }
}

// Singleton instance
export const dbPerformanceMonitor = new DatabasePerformanceMonitor();

// Higher-order function to wrap database queries with performance monitoring
export function withDatabaseMonitoring<T extends (...args: any[]) => Promise<any>>(
  queryFn: T,
  queryName?: string
): T {
  return (async (...args: any[]) => {
    const startTime = performance.now();
    try {
      const result = await queryFn(...args);
      const duration = performance.now() - startTime;
      const name = queryName || queryFn.name || 'unknown-query';
      dbPerformanceMonitor.trackQuery(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const name = queryName || queryFn.name || 'unknown-query';
      dbPerformanceMonitor.trackQuery(`ERROR: ${name}`, duration);
      throw error;
    }
  }) as T;
}

// Functions already exported above