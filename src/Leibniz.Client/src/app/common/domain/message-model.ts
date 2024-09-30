export interface Message {
    title: string;
    content: string;
    type: 'Success' | 'Info' | 'Warning' | 'Error';
  }