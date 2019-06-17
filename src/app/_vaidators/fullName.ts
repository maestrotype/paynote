import { AbstractControl } from '@angular/forms';

export function validateFullName(control: AbstractControl) {
  if ( control.value === '' || control.value === null ) {
    return null;
  }
  // control.value.indexOf(' ') < 0||
  if (!control.value.match(/^[0-9a-z][a-zA-Z0-9\.\'\’\&\,\- ]+[0-9a-z\.\,]+$/i) ) {
    return { validFullName: true };
  }
  return null;
}

export function validateFullNameSignUp(control: AbstractControl) {
  if ( control.value === '' || control.value === null ) {
    return null;
  }
  // control.value.indexOf(' ') < 0||
  if (!control.value.match(/^[A-Z][a-zA-Z']+[ ]+[A-Z][a-zA-Z'\- ]*$/i)) {
    return { validFullName: true };
  }
  return null;
}

export function validateBussinesName(control: AbstractControl) {
  if ( control.value === '' || control.value === null ) {
    return null;
  }

  if ( !control.value.match(/^[0-9a-z][a-zA-Z0-9\.\'\’\&\,\- ]+[0-9a-z\.\,]+$/i) ) {
    return { validFullName: true };
  }
  return null;
}

export function validateFirstName(control: AbstractControl) {
  if ( control.value === '' || control.value === null ) {
    return null;
  }
  const regx = /^[0-9a-z][a-z0-9\.\'\&\- ]+[0-9a-z\.]+$/i;
  if ( !regx.test(control.value) ) {
    return { validFirstName: true };
  }
  return null;
}

export function validateLastName(control: AbstractControl) {
  if ( control.value === '' || control.value === null ) {
    return null;
  }
  const regx = /^[0-9a-z][a-z0-9\.\'\&\- ]+[0-9a-z\.]+$/i;
  if ( !regx.test(control.value) ) {
    return { validLastName: true };
  }
  return null;
}
