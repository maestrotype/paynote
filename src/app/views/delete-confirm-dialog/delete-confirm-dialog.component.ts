import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Inject
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { Action, Store } from "@ngrx/store";
//import { State } from "../../app.reducers";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-delete-confirm-dialog',
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrls: ['./delete-confirm-dialog.component.css']
})
export class DeleteConfirmDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      cancel?: Action,
      delete: Action,
      text: string,
      title: string
    },
    private mdDialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
//    private store: Store<State>
  ) { }

  public cancel() {
    if (this.data.cancel !== undefined){
//      this.store.dispatch(this.data.cancel);
      this.data.cancel
    }
    this.close();
  }

  public close() {
    this.mdDialogRef.close();
  }

  public delete() {
//    this.store.dispatch(this.data.delete);
    this.data.delete;
    this.close();
  }

  @HostListener("keydown.esc")
  public onEsc() {
    this.close();
  }

}