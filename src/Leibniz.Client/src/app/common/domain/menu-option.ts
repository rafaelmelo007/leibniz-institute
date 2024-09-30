export class MenuOption {
  label?: string;
  icon?: string;
  selected?: boolean;
  action?: (...args: any[]) => any;
}
