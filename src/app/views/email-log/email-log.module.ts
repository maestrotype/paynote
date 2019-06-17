import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailLogComponent } from './email-log.component';
import { EmailLogRoutingModule } from './email-log-routing.module';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EmailLogRoutingModule,
    PaginationModule,
    TooltipModule,
    
  ],
  declarations: [EmailLogComponent]
})
export class EmailLogModule { }
