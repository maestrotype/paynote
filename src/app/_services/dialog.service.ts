import { Injectable } from '@angular/core';
import {ConfirmDialogComponent} from '../views/confirm-dialog/confirm-dialog.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor( public dialog: MatDialog ) { }
  
  
  openDialog( objDataDialog: any ) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: objDataDialog
    });

    return dialogRef
  }
}
