import { AbstractControl } from '@angular/forms';

export function validateEmail(control: AbstractControl) {
  
  //console.log(control )
  if( control.value == '' || control.value == null ) {
    return null;
  }

  if( !control.value.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/) ) {
    return { validUrlSite: true };
  }
  return null;
}
