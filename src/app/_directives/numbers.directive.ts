import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appNumbers]'
})
export class NumbersDirective {

  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^-?[0-9]+(\.[0-9]*){0,1}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'Control', 'V'];

  constructor(private el: ElementRef) {
    
  }
  
  ngOnInit() {
//    debugger;
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex) && !event.ctrlKey) {
      event.preventDefault();
    }
  }

}
