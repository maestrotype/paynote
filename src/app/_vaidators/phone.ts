import { AbstractControl } from '@angular/forms';

export function validatePhone(control: AbstractControl) {
  
  //console.log(control )
  if( control.value == '' || control.value == null ) {
    return null;
  }

  if( control.value.indexOf('_') >= 0 ) {
    return { validPhone: true };
  }
  return null;
}