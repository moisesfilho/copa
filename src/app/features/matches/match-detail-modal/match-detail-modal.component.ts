import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-match-detail-modal',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './match-detail-modal.component.html',
  styleUrls: ['./match-detail-modal.component.css']
})
export class MatchDetailModalComponent {
  @Input() match: any = null;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
