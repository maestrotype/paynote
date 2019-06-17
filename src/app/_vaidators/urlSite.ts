import { AbstractControl } from '@angular/forms';

export function validateUrlSite(control: AbstractControl) {

  if ( control.value === '' || control.value === null ) {
    return null;
  }

  if ( !control.value.match(/^(www\.|.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/) ) {
    return { validUrlSite: true };
  }
  return null;
}
