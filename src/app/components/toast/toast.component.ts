import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscriptions = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.toastService.toast$.subscribe(toast => {
        this.toasts.push(toast);
        if (toast.duration && toast.duration > 0) {
          setTimeout(() => {
            this.remove(toast.id);
          }, toast.duration);
        }
      })
    );

    this.subscriptions.add(
      this.toastService.toastRemove$.subscribe(id => {
        this.remove(id);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}

