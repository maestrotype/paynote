import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {ManageRecuringComponent} from './manage-recuring.component';
import {ManageRecuringRoutingModule} from './manage-recuring-routing.module';

import {RecurringModule} from '../../_shared_modules/recurring/recurring.module';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    ManageRecuringRoutingModule,
    RecurringModule,
    MatTooltipModule
  ],
  declarations: [ManageRecuringComponent]
})
export class ManageRecuringModule { }
