import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ApiManageComponent} from '../../views/api-manage/api-manage.component';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    PaginationModule,
    FormsModule,
    ClipboardModule,
    MatCheckboxModule
  ],
  declarations: [ApiManageComponent],
  exports: [ApiManageComponent]
})
export class ApiManageModule { }