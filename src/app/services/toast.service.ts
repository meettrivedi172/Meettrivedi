import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  public toast$: Observable<ToastMessage> = this.toastSubject.asObservable();

  private toastRemoveSubject = new Subject<string>();
  public toastRemove$: Observable<string> = this.toastRemoveSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string, duration: number = 5000): string {
    const id = this.generateId();
    const toast: ToastMessage = {
      id,
      message,
      type,
      title,
      duration
    };
    this.toastSubject.next(toast);
    return id;
  }

  success(message: string, title?: string, duration?: number): string {
    return this.show(message, 'success', title, duration);
  }

  error(message: string, title: string = 'Error', duration?: number): string {
    return this.show(message, 'error', title, duration || 7000);
  }

  warning(message: string, title?: string, duration?: number): string {
    return this.show(message, 'warning', title, duration);
  }

  info(message: string, title?: string, duration?: number): string {
    return this.show(message, 'info', title, duration);
  }

  remove(id: string): void {
    this.toastRemoveSubject.next(id);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

