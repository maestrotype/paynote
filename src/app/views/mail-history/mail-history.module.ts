import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailHistoryComponent } from './mail-history.component';
import { MailHistoryRoutingModule } from './mail-history-routing.module';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { NgxEditorModule } from 'ngx-editor';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MailHistoryRoutingModule,
    NgxEditorModule,
    PaginationModule
  ],
  declarations: [MailHistoryComponent]
})
export class MailHistoryModule { }
