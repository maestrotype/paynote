import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {CampaignStatisticComponent} from './campaign-statistic.component';
import {CampaignStatisticRoutingModule} from './campaign-statistic-routing.module';
import {MatDatepickerModule} from '@angular/material/datepicker';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [
    FormsModule,
    CommonModule, 
    CampaignStatisticRoutingModule,
    MatDatepickerModule,
    PaginationModule,
    TooltipModule,
    MatTooltipModule
  ],
  declarations: [CampaignStatisticComponent]
})
export class CampaignStatisticModule { }
