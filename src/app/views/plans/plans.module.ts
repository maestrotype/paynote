import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import {PlansComponent} from './plans.component';
import {PlansRoutingModule} from './plans-routing.module';
//import {PaginationModule} from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PlansRoutingModule,
    PaginationModule,
    TooltipModule,
    MatSlideToggleModule
    
    
  ],
  declarations: [PlansComponent],
  exports: [PlansComponent]
})
export class PlansModule { }
