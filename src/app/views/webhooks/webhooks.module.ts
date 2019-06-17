import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebhooksComponent } from './webhooks.component';
import { WebhooksRoutingModule } from './webhooks-routing.module';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { FormsModule } from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    CommonModule,
    WebhooksRoutingModule,
    PaginationModule,
    FormsModule,
    MatSlideToggleModule
  ],
  declarations: [WebhooksComponent]
})
export class WebhooksModule { }
