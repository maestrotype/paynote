import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RulesForTransactionsRoutingModule} from './rules-for-transactions-routing.module';
import {RulesForTransactionsComponent} from './rules-for-transactions.component';
import { FormsModule } from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    RulesForTransactionsRoutingModule,
    FormsModule,
    MatTooltipModule
  ],
  declarations: [RulesForTransactionsComponent]
})
export class RulesForTransactionsModule { }
