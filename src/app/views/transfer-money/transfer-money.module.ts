import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {TransferMoneyComponent} from './transfer-money.component';
import {TransferMoneyRoutingModule} from './transfer-money-routing.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    TransferMoneyRoutingModule
  ],
  declarations: [ TransferMoneyComponent ]
})
export class TransferMoneyModule { }
