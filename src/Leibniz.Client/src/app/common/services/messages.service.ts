import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Message } from '../domain/message-model';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$: Observable<Message[]> = this.messagesSubject
    .asObservable()
    .pipe(filter((messages) => messages && messages.length > 0));

  constructor(private toastrService: ToastrService) {}

  success(content: string, title: string) {
    this.showMessages({
      content,
      title,
      type: 'Success',
    });
  }

  info(content: string, title: string) {
    this.showMessages({
      content,
      title,
      type: 'Info',
    });
  }

  warn(content: string, title: string) {
    this.showMessages({
      content,
      title,
      type: 'Warning',
    });
  }

  error(content: string, title: string) {
    this.showMessages({
      content,
      title,
      type: 'Error',
    });
  }

  showMessages(...messages: Message[]) {
    this.messagesSubject.next(messages);
    messages.forEach((message) => {
      if (message.type == 'Success') {
        this.toastrService.success(message.content, message.title);
      } else if (message.type == 'Info') {
        this.toastrService.info(message.content, message.title);
      } else if (message.type == 'Warning') {
        this.toastrService.warning(message.content, message.title);
      } else if (message.type == 'Error') {
        this.toastrService.error(message.content, message.title);
      }
    });
  }
}
