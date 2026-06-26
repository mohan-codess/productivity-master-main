const fs = require('fs');
const files = [
  'components/analytics/CalendarHeatmap.tsx',
  'components/analytics/CompletionChart.tsx',
  'components/dashboard/FitnessSummary.tsx',
  'components/dashboard/ProgressChart.tsx',
  'components/dashboard/WeeklyReportChart.tsx',
  'components/trip/AnalyticsCharts.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/borderRadius:\s*48/g, 'borderRadius: "var(--r-xl)"');
  content = content.replace(/borderRadius:\s*9999/g, 'borderRadius: 14');
  content = content.replace(/borderRadius:\s*'9999px'/g, 'borderRadius: "var(--r-md)"');
  fs.writeFileSync(file, content);
}
console.log('Fixed radiuses in the 6 files!');
