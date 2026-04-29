import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { Expense } from '../../core/models/models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Analytics</h2>
        <p class="page-subtitle">Insights into your spending patterns</p>
      </div>

      <div class="stats-grid" style="margin-bottom: 24px;">
        <div class="stat-card">
          <div class="stat-label">Top Category</div>
          <div class="stat-value" style="font-size: 1.3rem;">{{ topCategory() }}</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-label">Avg per Month</div>
          <div class="stat-value gold">{{ expenseService.currencySymbol() }}{{ monthlyAverage().toLocaleString('en-IN') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg per Transaction</div>
          <div class="stat-value accent">{{ expenseService.currencySymbol() }}{{ avgTransaction().toLocaleString('en-IN') }}</div>
        </div>
      </div>

      <div class="analytics-grid">
        <div class="chart-wrap">
          <div class="chart-title">📅 Monthly Spending Trend</div>
          <canvas #lineChart width="500" height="220"></canvas>
        </div>
        <div class="chart-wrap">
          <div class="chart-title">🥧 Category Breakdown</div>
          <canvas #pieChart width="320" height="220"></canvas>
        </div>
      </div>

      <div class="chart-wrap mt-24">
        <div class="chart-title">📊 Spending by Category</div>
        <canvas #barChart width="900" height="200"></canvas>
      </div>
    </div>
  `,
  styles: [`
    .page { animation: fadeSlide 300ms ease forwards; }
    .page-header { margin-bottom: 32px; }
    .page-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--text-100); }
    .page-subtitle { color: var(--text-300); margin-top: 6px; }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .stat-card {
      background: var(--bg-glass); backdrop-filter: blur(16px);
      border: 1px solid var(--border); border-radius: var(--radius);
      padding: 24px;
    }
    .stat-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; color: var(--text-300); margin-bottom: 12px; }
    .stat-value { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; color: var(--text-100); }
    .stat-value.accent { color: var(--accent); }
    .stat-value.gold { color: var(--gold); }

    .analytics-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; margin-top: 24px; }
    .chart-wrap {
      background: var(--bg-glass); backdrop-filter: blur(16px);
      border: 1px solid var(--border); border-radius: var(--radius);
      padding: 24px;
    }
    .chart-title { font-size: 0.85rem; font-weight: 600; color: var(--text-200); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    canvas { display: block; max-width: 100%; height: auto !important; }
    .mt-24 { margin-top: 24px; }
  `]
})
export class AnalyticsComponent implements AfterViewInit {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  expenseService = inject(ExpenseService);

  ngAfterViewInit() {
    this.renderCharts();
  }

  private renderCharts() {
    const expenses = this.expenseService.expenses();
    if (expenses.length === 0) return;

    this.drawLineChart(expenses);
    this.drawPieChart(expenses);
    this.drawBarChart(expenses);
  }

  topCategory() {
    const totals = this.getCategoryTotals();
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'None';
  }

  monthlyAverage() {
    const expenses = this.expenseService.expenses();
    const months = new Set(expenses.map((e: Expense) => e.date.slice(0, 7))).size || 1;
    return this.expenseService.totalSpent() / months;
  }

  avgTransaction() {
    const expenses = this.expenseService.expenses();
    return expenses.length > 0 ? this.expenseService.totalSpent() / expenses.length : 0;
  }

  private getCategoryTotals() {
    const totals: { [key: string]: number } = {};
    this.expenseService.expenses().forEach((e: Expense) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }

  private getTextColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--text-200').trim() || '#C8D0E8';
  }

  private getGridColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(255,255,255,0.06)';
  }

  private drawLineChart(expenses: Expense[]) {
    const canvas = this.lineChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement!.clientWidth - 48;
    canvas.height = 220;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = new Date();
    const months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('default', { month: 'short' })
      });
    }

    const data = months.map(m => expenses.filter(e => e.date.startsWith(m.key)).reduce((s, e) => s + e.amount, 0));
    const W = canvas.width, H = canvas.height;
    const padL = 60, padR = 20, padT = 20, padB = 40;
    const chartW = W - padL - padR, chartH = H - padT - padB;
    const maxVal = Math.max(...data, 1);

    const textColor = this.getTextColor();
    const gridColor = this.getGridColor();

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + chartH * (1 - i / 4);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.font = '11px DM Sans,sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${this.expenseService.currencySymbol()}${Math.round(maxVal * i / 4)}`, padL - 10, y + 4);
    }

    const pts = data.map((v, i) => ({
      x: padL + i * (chartW / (months.length - 1)),
      y: padT + chartH * (1 - v / maxVal)
    }));

    // Area
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, 'rgba(0,200,150,0.25)');
    grad.addColorStop(1, 'rgba(0,200,150,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(pts[0].x, padT + chartH);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, padT + chartH);
    ctx.closePath(); ctx.fill();

    // Line
    ctx.strokeStyle = '#00C896'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Dots
    pts.forEach((p, i) => {
      ctx.fillStyle = '#00C896';
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = textColor;
      ctx.font = '10px DM Sans,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(months[i].label, p.x, H - padB + 16);
    });
  }

  private drawPieChart(expenses: Expense[]) {
    const canvas = this.pieChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.parentElement!.clientWidth - 48;
    canvas.width = W; canvas.height = 220;
    ctx.clearRect(0, 0, W, 220);

    const totals = this.getCategoryTotals();
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    const colors = ['#00C896', '#F0C060', '#FF5E78', '#6495ED', '#9B59B6'];

    const cx = 100, cy = 110, r = 80, ri = 40;
    let angle = -Math.PI / 2;

    const textColor = this.getTextColor();

    entries.forEach(([cat, val], i) => {
      const slice = (val / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      angle += slice;

      // Legend
      const lx = 200, ly = 40 + i * 25;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath(); ctx.roundRect(lx, ly, 12, 12, 3); ctx.fill();
      ctx.fillStyle = textColor;
      ctx.font = '11px DM Sans,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(cat.slice(0,12), lx + 20, ly + 10);
    });

    // Hole — use current theme background
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-900').trim() || '#080C12';
    ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI * 2);
    ctx.fillStyle = bgColor; ctx.fill();
  }

  private drawBarChart(expenses: Expense[]) {
      const canvas = this.barChartRef.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.parentElement!.clientWidth - 48;
      canvas.height = 200;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const totals = this.getCategoryTotals();
      const entries = Object.entries(totals).sort((a,b) => b[1]-a[1]).slice(0,8);
      const W = canvas.width, H = canvas.height;
      const padL = 60, padR = 20, padT = 20, padB = 40;
      const chartW = W - padL - padR, chartH = H - padT - padB;
      const maxVal = Math.max(...entries.map(([,v])=>v), 1);
      const barW = (chartW / entries.length) - 20;

      const textColor = this.getTextColor();

      entries.forEach(([cat, val], i) => {
          const barH = (val / maxVal) * chartH;
          const x = padL + i * (chartW / entries.length) + 10;
          const y = padT + chartH - barH;

          const grad = ctx.createLinearGradient(0, y, 0, y + barH);
          grad.addColorStop(0, '#00C896');
          grad.addColorStop(1, 'rgba(0,200,150,0.3)');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 4); ctx.fill();

          ctx.fillStyle = textColor;
          ctx.font = '10px DM Sans,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(cat.split(' ')[0], x + barW/2, H - padB + 15);
      });
  }
}
