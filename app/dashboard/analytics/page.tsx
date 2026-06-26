'use client';

import React, { useState, useEffect } from 'react';
import CalendarHeatmap from '@/components/analytics/CalendarHeatmap';
import CompletionChart from '@/components/analytics/CompletionChart';
import type { HeatmapCell, DailyTrend } from '@/types/analytics';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [trends, setTrends] = useState<DailyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(30);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [heatmapRes, trendsRes] = await Promise.all([
          fetch('/api/analytics/heatmap?months=12'),
          fetch(`/api/analytics/trends?days=${trendDays}`),
        ]);

        if (heatmapRes.ok) {
          const { data } = await heatmapRes.json() as { data: HeatmapCell[] };
          setHeatmap(data ?? []);
        }
        if (trendsRes.ok) {
          const { data } = await trendsRes.json() as { data: DailyTrend[] };
          setTrends(data ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [trendDays]);

  if (loading && heatmap.length === 0) {
    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Global Analytics</h1>
        <div style={{ height: 200, background: 'var(--bg-glass)', borderRadius: 16, animation: 'pulse 2s infinite' }} />
        <div style={{ height: 300, background: 'var(--bg-glass)', borderRadius: 16, animation: 'pulse 2s infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 16px 120px', display: 'flex', flexDirection: 'column', gap: 32, width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Global Analytics</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Overview of your habit completions across all routines.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Activity Heatmap (Last 12 Months)</h3>
          <CalendarHeatmap data={heatmap} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Completion Trends</h3>
          <CompletionChart data={trends} currentRange={trendDays} onRangeChange={setTrendDays} />
        </div>
      </motion.div>
    </div>
  );
}
