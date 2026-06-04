import {
  Component, inject, AfterViewInit, ElementRef,
  ViewChild, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { Expense } from '../../core/models/models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="analytics-page">

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="badge-dot"></span>
            Live Analytics
          </div>
          <h1 class="page-title">Financial Insights</h1>
          <p class="page-subtitle">A comprehensive view of your spending behaviour and patterns.</p>
        </div>
        <div class="header-right">
          <div class="date-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Last 6 Months
          </div>
        </div>
      </div>

      <!-- KPI Cards Row -->
      <div class="kpi-grid">

        <div class="kpi-card kpi-accent">
          <div class="kpi-header">
            <span class="kpi-label">Top Category</span>
            <div class="kpi-icon icon-green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            </div>
          </div>
          <div class="kpi-value text-category">{{ topCategory() }}</div>
          <div class="kpi-footer">Highest spend category</div>
        </div>

        <div class="kpi-card kpi-gold">
          <div class="kpi-header">
            <span class="kpi-label">Monthly Average</span>
            <div class="kpi-icon icon-gold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div class="kpi-value text-gold tabular">{{ expenseService.currencySymbol() }}{{ fmt(monthlyAverage()) }}</div>
          <div class="kpi-footer">Avg per calendar month</div>
        </div>

        <div class="kpi-card kpi-purple">
          <div class="kpi-header">
            <span class="kpi-label">Per Transaction</span>
            <div class="kpi-icon icon-purple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
          </div>
          <div class="kpi-value text-purple tabular">{{ expenseService.currencySymbol() }}{{ fmt(avgTransaction()) }}</div>
          <div class="kpi-footer">Avg amount per entry</div>
        </div>

        <div class="kpi-card kpi-danger">
          <div class="kpi-header">
            <span class="kpi-label">Total Transactions</span>
            <div class="kpi-icon icon-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
          </div>
          <div class="kpi-value tabular">{{ expenseService.expenses().length }}</div>
          <div class="kpi-footer">All-time entries logged</div>
        </div>

      </div>

      <!-- Charts Row -->
      <div class="charts-row">

        <!-- Line Chart -->
        <div class="chart-card chart-line-wrap">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <span class="chart-title-dot dot-green"></span>
              Monthly Spending Trend
            </div>
            <span class="chart-period">Jan – {{ currentMonthLabel }}</span>
          </div>
          <div class="canvas-container" #lineWrap>
            <canvas #lineChart></canvas>
            <!-- Tooltip -->
            <div class="chart-tooltip" #lineTooltip>
              <div class="tooltip-label" #tooltipLabel></div>
              <div class="tooltip-value" #tooltipValue></div>
            </div>
          </div>
        </div>

        <!-- Donut Chart -->
        <div class="chart-card chart-donut-wrap">
          <div class="chart-card-header">
            <div class="chart-card-title">
              <span class="chart-title-dot dot-gold"></span>
              Category Split
            </div>
          </div>
          <div class="donut-layout">
            <div class="canvas-container donut-canvas-wrap" #donutWrap>
              <canvas #pieChart></canvas>
              <div class="donut-center">
                <div class="donut-center-value tabular">{{ expenseService.currencySymbol() }}{{ fmt(expenseService.totalSpent()) }}</div>
                <div class="donut-center-label">Total Spent</div>
              </div>
            </div>
            <ul class="legend-list" #legendEl></ul>
          </div>
        </div>

      </div>

      <!-- Bar Chart full width -->
      <div class="chart-card mt-6">
        <div class="chart-card-header">
          <div class="chart-card-title">
            <span class="chart-title-dot dot-purple"></span>
            Spending by Category
          </div>
        </div>
        <div class="canvas-container" #barWrap>
          <canvas #barChart></canvas>
          <div class="chart-tooltip" #barTooltip>
            <div class="tooltip-label" #barTooltipLabel></div>
            <div class="tooltip-value" #barTooltipValue></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="expenseService.expenses().length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No data yet</h3>
        <p>Add your first expense to start seeing insights here.</p>
      </div>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* ── Page Layout ── */
    .analytics-page {
      padding: 32px;
      max-width: 1300px;
      margin: 0 auto;
      font-family: 'Inter', 'DM Sans', sans-serif;
      animation: fadeSlide 280ms ease forwards;
    }
    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Page Header ── */
    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 10px;
    }
    .badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 6px var(--accent);
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(0.75); }
    }
    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-100);
      letter-spacing: -0.03em;
      line-height: 1.15;
    }
    .page-subtitle {
      color: var(--text-300);
      font-size: 0.9rem;
      margin-top: 6px;
    }
    .date-chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 16px;
      background: var(--bg-glass);
      border: 1px solid var(--border);
      border-radius: 100px;
      font-size: 0.8rem;
      color: var(--text-200);
      backdrop-filter: blur(10px);
      transition: all 200ms ease;
    }
    .date-chip:hover {
      border-color: var(--border-accent);
      color: var(--accent);
    }

    /* ── KPI Cards ── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      position: relative;
      padding: 22px 22px 18px;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      overflow: hidden;
      transition: transform 220ms cubic-bezier(0.4,0,0.2,1),
                  box-shadow 220ms cubic-bezier(0.4,0,0.2,1),
                  border-color 220ms cubic-bezier(0.4,0,0.2,1);
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      opacity: 0;
      transition: opacity 220ms ease;
    }
    .kpi-card:hover { transform: translateY(-3px); }
    .kpi-card:hover::before { opacity: 1; }

    .kpi-accent:hover { box-shadow: 0 12px 40px rgba(0,200,150,0.15); border-color: rgba(0,200,150,0.2); }
    .kpi-gold:hover   { box-shadow: 0 12px 40px rgba(240,192,96,0.12); border-color: rgba(240,192,96,0.2); }
    .kpi-purple:hover { box-shadow: 0 12px 40px rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.2); }
    .kpi-danger:hover { box-shadow: 0 12px 40px rgba(255,94,120,0.12); border-color: rgba(255,94,120,0.2); }

    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .kpi-label {
      font-size: 0.73rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-300);
    }
    .kpi-icon {
      width: 32px; height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-green  { background: rgba(0,200,150,0.12); color: #00C896; }
    .icon-gold   { background: rgba(240,192,96,0.12); color: #F0C060; }
    .icon-purple { background: rgba(139,92,246,0.12); color: #8B5CF6; }
    .icon-danger { background: rgba(255,94,120,0.12); color: #FF5E78; }

    .kpi-value {
      font-size: 1.7rem;
      font-weight: 700;
      color: var(--text-100);
      letter-spacing: -0.04em;
      line-height: 1;
      margin-bottom: 8px;
    }
    .kpi-footer {
      font-size: 0.73rem;
      color: var(--text-400);
    }

    /* Accent text colours */
    .text-category { font-size: 1.15rem; letter-spacing: -0.01em; color: var(--accent); }
    .text-gold   { color: #F0C060; }
    .text-purple { color: #8B5CF6; }
    .tabular { font-variant-numeric: tabular-nums; }

    /* ── Charts Layout ── */
    .charts-row {
      display: grid;
      grid-template-columns: 1.65fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .mt-6 { margin-top: 0; }

    .chart-card {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 24px;
      transition: border-color 220ms ease;
    }
    .chart-card:hover { border-color: rgba(255,255,255,0.09); }

    .chart-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .chart-card-title {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-200);
      letter-spacing: -0.01em;
    }
    .chart-title-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot-green  { background: #00C896; box-shadow: 0 0 6px rgba(0,200,150,0.5); }
    .dot-gold   { background: #F0C060; box-shadow: 0 0 6px rgba(240,192,96,0.5); }
    .dot-purple { background: #8B5CF6; box-shadow: 0 0 6px rgba(139,92,246,0.5); }
    .chart-period {
      font-size: 0.72rem;
      color: var(--text-400);
      font-weight: 500;
    }

    /* ── Canvas Container ── */
    .canvas-container {
      position: relative;
      width: 100%;
    }
    canvas { display: block; width: 100% !important; }

    /* ── Tooltip ── */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(13, 20, 32, 0.92);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 10px 14px;
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 140ms ease, transform 140ms ease;
      white-space: nowrap;
      z-index: 10;
    }
    .chart-tooltip.visible { opacity: 1; transform: translateY(0); }
    .tooltip-label { font-size: 0.72rem; color: var(--text-300); font-weight: 500; margin-bottom: 4px; }
    .tooltip-value { font-size: 1rem; font-weight: 700; color: var(--text-100); font-variant-numeric: tabular-nums; }

    /* ── Donut Layout ── */
    .donut-layout {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .donut-canvas-wrap {
      position: relative;
      flex-shrink: 0;
      width: 160px;
      height: 160px;
    }
    .donut-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
    }
    .donut-center-value {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-100);
    }
    .donut-center-label {
      font-size: 0.62rem;
      color: var(--text-400);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 3px;
    }

    /* ── Legend ── */
    .legend-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.78rem;
      color: var(--text-200);
      cursor: default;
      padding: 6px 8px;
      border-radius: 8px;
      transition: background 160ms ease;
    }
    .legend-item:hover { background: rgba(255,255,255,0.04); }
    .legend-dot {
      width: 9px; height: 9px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .legend-pct  { font-variant-numeric: tabular-nums; font-weight: 600; color: var(--text-300); font-size: 0.72rem; }

    /* ── Empty State ── */
    .empty-state {
      text-align: center;
      padding: 64px 24px;
      color: var(--text-300);
    }
    .empty-icon { font-size: 3rem; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.2rem; font-weight: 600; color: var(--text-200); margin-bottom: 8px; }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .analytics-page { padding: 20px 16px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
      .donut-layout { flex-direction: column; align-items: flex-start; }
      .donut-canvas-wrap { width: 100%; height: 180px; }
    }
    @media (max-width: 480px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .kpi-value { font-size: 1.4rem; }
    }
  `]
})
export class AnalyticsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineWrap')  lineWrapRef!: ElementRef<HTMLDivElement>;
  @ViewChild('pieChart')  pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutWrap') donutWrapRef!: ElementRef<HTMLDivElement>;
  @ViewChild('barChart')  barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barWrap')   barWrapRef!: ElementRef<HTMLDivElement>;
  @ViewChild('lineTooltip')    lineTooltipRef!: ElementRef<HTMLDivElement>;
  @ViewChild('tooltipLabel')   tooltipLabelRef!: ElementRef<HTMLDivElement>;
  @ViewChild('tooltipValue')   tooltipValueRef!: ElementRef<HTMLDivElement>;
  @ViewChild('barTooltip')     barTooltipRef!: ElementRef<HTMLDivElement>;
  @ViewChild('barTooltipLabel') barTooltipLabelRef!: ElementRef<HTMLDivElement>;
  @ViewChild('barTooltipValue') barTooltipValueRef!: ElementRef<HTMLDivElement>;
  @ViewChild('legendEl') legendElRef!: ElementRef<HTMLUListElement>;

  expenseService = inject(ExpenseService);
  private cdr = inject(ChangeDetectorRef);

  currentMonthLabel = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

  // Palette – accessible, contrast-checked colours
  private palette = ['#00C896', '#F0C060', '#8B5CF6', '#FF5E78', '#38BDF8', '#FB923C', '#4ADE80', '#F472B6'];

  private linePoints: { x: number; y: number; val: number; label: string }[] = [];
  private barRects: { x: number; y: number; w: number; h: number; cat: string; val: number }[] = [];
  private resizeObs?: ResizeObserver;

  ngAfterViewInit() {
    const target = this.lineWrapRef?.nativeElement ?? document.body;
    this.resizeObs = new ResizeObserver(() => {
      this.renderCharts();
      this.cdr.detectChanges();
    });
    this.resizeObs.observe(target);
    this.renderCharts();
  }

  ngOnDestroy() { this.resizeObs?.disconnect(); }

  /* ── Public Helpers ── */
  fmt(n: number) { return Math.round(n).toLocaleString('en-IN'); }

  topCategory() {
    const totals = this.getCategoryTotals();
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'None';
  }
  monthlyAverage() {
    const exp = this.expenseService.expenses();
    const months = new Set(exp.map((e: Expense) => e.date.slice(0, 7))).size || 1;
    return this.expenseService.totalSpent() / months;
  }
  avgTransaction() {
    const exp = this.expenseService.expenses();
    return exp.length > 0 ? this.expenseService.totalSpent() / exp.length : 0;
  }

  /* ── Chart Rendering ── */
  private renderCharts() {
    const expenses = this.expenseService.expenses();
    this.drawLineChart(expenses);
    this.drawDonutChart(expenses);
    this.drawBarChart(expenses);
  }

  private getCategoryTotals() {
    const totals: Record<string, number> = {};
    this.expenseService.expenses().forEach((e: Expense) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }

  private css(prop: string, fallback: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(prop).trim() || fallback;
  }

  /* ═══════════════════════════════
     LINE CHART – smooth monotone
  ═══════════════════════════════ */
  private drawLineChart(expenses: Expense[]) {
    const canvas = this.lineChartRef?.nativeElement;
    const wrap   = this.lineWrapRef?.nativeElement;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = window.devicePixelRatio || 1;
    const W   = wrap.clientWidth;
    const H   = 230;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, W, H);

    // Build 6-month series
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('default', { month: 'short' })
      };
    });

    const data = months.map(m =>
      expenses.filter(e => e.date.startsWith(m.key)).reduce((s, e) => s + e.amount, 0)
    );

    const pL = 60, pR = 24, pT = 20, pB = 44;
    const cW = W - pL - pR, cH = H - pT - pB;
    const maxVal = Math.max(...data, 1);

    const textColor = this.css('--text-300', '#8A96B8');
    const gridColor = 'rgba(255,255,255,0.04)';
    const accent    = '#00C896';
    const sym       = this.expenseService.currencySymbol();

    // Grid lines + Y labels
    ctx.font = '11px Inter, DM Sans, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = pT + cH * (1 - i / 4);
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(W - pR, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = textColor;
      ctx.fillText(`${sym}${Math.round(maxVal * i / 4).toLocaleString('en-IN')}`, pL - 8, y + 4);
    }

    // Compute points
    const pts = data.map((v, i) => ({
      x: pL + (i / (months.length - 1)) * cW,
      y: pT + cH * (1 - (v / maxVal)),
      val: v,
      label: months[i].label
    }));
    this.linePoints = pts;

    // Smooth cubic bezier helper
    const smoothPath = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const cp1x = (points[i].x + points[i + 1].x) / 2;
        const cp1y = points[i].y;
        const cp2x = (points[i].x + points[i + 1].x) / 2;
        const cp2y = points[i + 1].y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
      }
    };

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pT, 0, pT + cH);
    grad.addColorStop(0, 'rgba(0,200,150,0.22)');
    grad.addColorStop(0.7, 'rgba(0,200,150,0.05)');
    grad.addColorStop(1, 'rgba(0,200,150,0)');
    ctx.fillStyle = grad;
    smoothPath(pts);
    ctx.lineTo(pts[pts.length - 1].x, pT + cH);
    ctx.lineTo(pts[0].x, pT + cH);
    ctx.closePath();
    ctx.fill();

    // Stroke line
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0,200,150,0.4)';
    ctx.shadowBlur = 8;
    smoothPath(pts);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dots + X labels
    pts.forEach(p => {
      // Outer ring
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.fillStyle = this.css('--bg-800', '#0D1420');
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // X label
      ctx.fillStyle = textColor;
      ctx.font = '11px Inter, DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, H - pB + 18);
    });

    // Hover interaction
    this.addLineHover(canvas, W, H, pT, pB, cH, sym);
  }

  private addLineHover(canvas: HTMLCanvasElement, W: number, H: number, pT: number, pB: number, cH: number, sym: string) {
    const tooltip    = this.lineTooltipRef?.nativeElement;
    const lblEl      = this.tooltipLabelRef?.nativeElement;
    const valEl      = this.tooltipValueRef?.nativeElement;
    if (!tooltip || !lblEl || !valEl) return;

    const RADIUS = 28;

    const onMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      const closest = this.linePoints.reduce<typeof this.linePoints[0] | null>((best, p) => {
        const dist = Math.abs(mx - p.x);
        return (!best || dist < Math.abs(mx - best.x)) ? p : best;
      }, null);

      if (closest && Math.abs(mx - closest.x) < RADIUS) {
        lblEl.textContent = closest.label;
        valEl.textContent = `${sym}${Math.round(closest.val).toLocaleString('en-IN')}`;
        const tx = Math.min(closest.x + 12, W - 140);
        const ty = Math.max(closest.y - 52, 4);
        tooltip.style.left = tx + 'px';
        tooltip.style.top  = ty + 'px';
        tooltip.classList.add('visible');
      } else {
        tooltip.classList.remove('visible');
      }
    };
    canvas.onmousemove = e => onMove(e.clientX, e.clientY);
    canvas.onmouseleave = () => tooltip.classList.remove('visible');
  }

  /* ═══════════════════════════════
     DONUT CHART
  ═══════════════════════════════ */
  private drawDonutChart(expenses: Expense[]) {
    const canvas = this.pieChartRef?.nativeElement;
    const wrap   = this.donutWrapRef?.nativeElement;
    const legendEl = this.legendElRef?.nativeElement;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR  = window.devicePixelRatio || 1;
    const SIZE = 160;
    canvas.width  = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width  = SIZE + 'px';
    canvas.style.height = SIZE + 'px';
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, SIZE, SIZE);

    const totals = this.getCategoryTotals();
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    if (total === 0) return;

    const cx = SIZE / 2, cy = SIZE / 2;
    const R  = 72, ri = 42;
    let angle = -Math.PI / 2;

    entries.forEach(([, val], i) => {
      const slice = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = this.palette[i % this.palette.length];
      ctx.fill();

      // Subtle gap between slices
      ctx.strokeStyle = this.css('--bg-800', '#0D1420');
      ctx.lineWidth = 2;
      ctx.stroke();
      angle += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, ri, 0, Math.PI * 2);
    ctx.fillStyle = this.css('--bg-800', '#0D1420');
    ctx.fill();

    // Legend
    if (legendEl) {
      legendEl.innerHTML = '';
      const sym = this.expenseService.currencySymbol();
      entries.forEach(([cat, val], i) => {
        const pct = Math.round((val / total) * 100);
        const li = document.createElement('li');
        li.className = 'legend-item';
        li.innerHTML = `
          <span class="legend-dot" style="background:${this.palette[i % this.palette.length]}"></span>
          <span class="legend-name" title="${cat}">${cat}</span>
          <span class="legend-pct">${pct}%</span>
        `;
        legendEl.appendChild(li);
      });
    }
  }

  /* ═══════════════════════════════
     BAR CHART
  ═══════════════════════════════ */
  private drawBarChart(expenses: Expense[]) {
    const canvas = this.barChartRef?.nativeElement;
    const wrap   = this.barWrapRef?.nativeElement;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = window.devicePixelRatio || 1;
    const W   = wrap.clientWidth;
    const H   = 200;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, W, H);

    const totals  = this.getCategoryTotals();
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (entries.length === 0) return;

    const pL = 16, pR = 16, pT = 16, pB = 40;
    const cW = W - pL - pR, cH = H - pT - pB;
    const maxVal = Math.max(...entries.map(([, v]) => v), 1);
    const slot   = cW / entries.length;
    const barW   = Math.max(slot * 0.52, 20);
    const textColor = this.css('--text-300', '#8A96B8');
    const sym = this.expenseService.currencySymbol();

    this.barRects = [];

    entries.forEach(([cat, val], i) => {
      const barH = (val / maxVal) * cH;
      const x    = pL + i * slot + (slot - barW) / 2;
      const y    = pT + cH - barH;
      const color = this.palette[i % this.palette.length];

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '44');
      ctx.fillStyle = grad;
      // Rounded top corners
      const r = Math.min(6, barW / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      // X label
      const shortName = cat.split(' ')[0];
      ctx.fillStyle = textColor;
      ctx.font = '11px Inter, DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shortName, x + barW / 2, H - pB + 18);

      this.barRects.push({ x, y, w: barW, h: barH, cat, val });
    });

    this.addBarHover(canvas, sym);
  }

  private addBarHover(canvas: HTMLCanvasElement, sym: string) {
    const tooltip = this.barTooltipRef?.nativeElement;
    const lblEl   = this.barTooltipLabelRef?.nativeElement;
    const valEl   = this.barTooltipValueRef?.nativeElement;
    if (!tooltip || !lblEl || !valEl) return;

    const onMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const hit = this.barRects.find(r => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h);
      if (hit) {
        lblEl.textContent = hit.cat;
        valEl.textContent = `${sym}${Math.round(hit.val).toLocaleString('en-IN')}`;
        tooltip.style.left = (hit.x + hit.w / 2 - 60) + 'px';
        tooltip.style.top  = (hit.y - 52) + 'px';
        tooltip.classList.add('visible');
      } else {
        tooltip.classList.remove('visible');
      }
    };
    canvas.onmousemove = e => onMove(e.clientX, e.clientY);
    canvas.onmouseleave = () => tooltip.classList.remove('visible');
  }
}
