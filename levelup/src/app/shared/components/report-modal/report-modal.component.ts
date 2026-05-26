import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ReportReason,
  ReportTargetType,
} from '../../../core/models/report.model';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-report-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './report-modal.component.html',
  styleUrl: './report-modal.component.scss',
})
export class ReportModalComponent {
  @Input() open = false;
  @Input({ required: true }) targetType!: ReportTargetType;
  @Input({ required: true }) targetId!: string;
  @Output() closed = new EventEmitter<void>();

  private reportService = inject(ReportService);

  submitting = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null);

  reasons: { value: ReportReason; label: string }[] = [
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'HATE_SPEECH', label: 'Hate speech' },
    { value: 'OTHER', label: 'Other' },
  ];

  form = new FormGroup({
    reason: new FormControl<ReportReason | null>(null, Validators.required),
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);

    this.reportService
      .submitReport({
        targetType: this.targetType,
        targetId: this.targetId,
        reason: this.form.value.reason!,
      })
      .subscribe({
        next: () => {
          this.submitted.set(true);
          this.submitting.set(false);
        },
        error: (err) => {
          this.error.set(
            err.status === 409
              ? 'You have already reported this content.'
              : 'Failed to submit report. Please try again.',
          );
          this.submitting.set(false);
        },
      });
  }

  close(): void {
    this.submitted.set(false);
    this.error.set(null);
    this.form.reset();
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('report-overlay')) {
      this.close();
    }
  }
}
