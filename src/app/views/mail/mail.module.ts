import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailComponent } from './mail.component';
import { MailRoutingModule } from './mail-routing.module';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';

@NgModule({
  imports: [
    CommonModule,
    MailRoutingModule,
    PaginationModule,
    NgxEditorModule,
    FormsModule,
  ],
  declarations: [MailComponent]
})
export class MailModule { }
