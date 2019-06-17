import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MerchantsRoutingModule} from './merchants-routing.module';
import {MerchantsComponent} from './merchants.component';
import { FormsModule } from '@angular/forms';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    CommonModule,
    MerchantsRoutingModule,
    FormsModule,
    PaginationModule,
    MatSlideToggleModule
    
  ],
  declarations: [MerchantsComponent]
})
export class MerchantsModule { }
