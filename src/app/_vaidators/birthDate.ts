import { AbstractControl } from '@angular/forms';

export function validateBirthDate(control: AbstractControl) {
  
  //console.log(control )
  if( control.value == '' || control.value == null ) {
    return null;
  }
  let intTimeUser = control.value.getTime();
//    console.log( intTimeUser )
  let objDateNow = new Date();
//    console.log(objDateNow )
  let intYearNow = objDateNow.getFullYear();
//    console.log(intYearNow )
  objDateNow.setFullYear( intYearNow - 18 );
  let intTimeNow = objDateNow.getTime();
//    console.log(intTimeNow )

  if( intTimeUser > intTimeNow ) {
    return { validBirthDate: true };
  }
  return null;
}