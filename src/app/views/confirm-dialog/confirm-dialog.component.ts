import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Inject
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { Action, Store } from "@ngrx/store";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {

  public isConfirmed: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      cancel?: Action,
//      confirm: Action,
      confirm: any,
      text: string,
      title: string,
      button_cancel_text: string,
      button_confirm_text: string
    },
    private mdDialogRef: MatDialogRef<ConfirmDialogComponent>,
//    private store: Store<State>
  ) { }
  
  public cancel() {
    this.mdDialogRef.close( false );
  }

  public close() {
    this.mdDialogRef.close( false );
  }
  
  public confirm() {
    this.mdDialogRef.close( true );
  }

  @HostListener("keydown.esc")
  public onEsc() {
    this.mdDialogRef.close( false );
  }

}