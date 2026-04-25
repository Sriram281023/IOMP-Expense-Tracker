import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Import Transactions 📥</h2>
        <p class="page-subtitle">Bulk import from your UPI app exports</p>
      </div>

      <div class="drop-zone" (click)="fileInput.click()"
           (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
        <div class="dz-icon">📄</div>
        <h3>{{ fileName || 'Drag & Drop your file here' }}</h3>
        <p>or click to browse — supports <strong>CSV</strong> and <strong>JSON</strong></p>
        <input #fileInput type="file" accept=".csv,.json" style="display:none;" (change)="onFileSelect($event)">
      </div>

      <div class="info-box mt-24">
        <h4>📋 File Format Instructions</h4>
        <p style="font-size: 0.85rem; color: var(--text-300); margin-bottom: 12px;">
          Your file should contain <code>date</code>, <code>description</code>, and <code>amount</code> columns.
        </p>
        <pre class="code-block">date,description,amount,category
2026-04-08,Swiggy Food,450.50,Food
2026-04-07,Uber Ride,125.00,Transport</pre>
      </div>

      <button class="btn btn-primary mt-24" style="width: auto; padding: 14px 32px;" (click)="processImport()">
        Upload & Import
      </button>
    </div>
  `,
  styles: [`
    .page { animation: fadeSlide 300ms ease forwards; }
    .page-header { margin-bottom: 32px; }
    .page-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--text-100); }
    .page-subtitle { color: var(--text-300); margin-top: 6px; }

    .drop-zone {
      border: 2px dashed var(--border); border-radius: var(--radius);
      padding: 60px 32px; text-align: center; cursor: pointer;
      background: rgba(255,255,255,0.02); transition: all var(--transition);
    }
    .drop-zone:hover { border-color: var(--accent); background: var(--accent-dim); }
    .dz-icon { font-size: 3rem; margin-bottom: 16px; }
    .drop-zone h3 { color: var(--text-100); font-size: 1.1rem; margin-bottom: 8px; }
    .drop-zone p { color: var(--text-400); font-size: 0.85rem; }

    .info-box { background: rgba(0,200,150,0.05); border: 1px solid rgba(0,200,150,0.2); border-radius: var(--radius); padding: 24px; }
    .info-box h4 { color: var(--accent); font-size: 0.9rem; margin-bottom: 12px; }
    .code-block { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-300); }

    .mt-24 { margin-top: 24px; }
  `]
})
export class ImportComponent {
  expenseService = inject(ExpenseService);
  fileName = '';
  fileContent = '';
  importResult = '';

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.readFile(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.readFile(file);
  }

  private readFile(file: File) {
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fileContent = e.target.result;
    };
    reader.readAsText(file);
  }

  processImport() {
    if (!this.fileContent) {
      alert('Please select a file first.');
      return;
    }

    try {
      if (this.fileName.endsWith('.json')) {
        this.processJSON(this.fileContent);
      } else {
        this.processCSV(this.fileContent);
      }
    } catch (error) {
      console.error(error);
      alert('Error parsing file. Please check the format.');
    }
  }

  private processJSON(content: string) {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      data.forEach(item => {
        this.expenseService.addExpense({
          amount: parseFloat(item.amount),
          category: item.category || 'Other',
          description: item.description || 'Imported Transaction',
          date: item.date || new Date().toISOString().split('T')[0],
          source: 'import'
        });
      });
      alert(`Imported ${data.length} transactions from JSON.`);
    }
  }

  private processCSV(content: string) {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 3) continue;

      const row: any = {};
      headers.forEach((h, index) => row[h] = values[index]?.trim());

      this.expenseService.addExpense({
        amount: parseFloat(row.amount),
        category: row.category || 'Other',
        description: row.description || 'Imported UPI',
        date: row.date || new Date().toISOString().split('T')[0],
        source: 'import'
      });
      count++;
    }
    alert(`Successfully imported ${count} transactions from CSV.`);
  }
}
