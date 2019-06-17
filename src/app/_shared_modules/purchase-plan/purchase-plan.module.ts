import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {PurchasePlanComponent} from '../../views/purchase-plan/purchase-plan.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    PurchasePlanComponent
  ],
  exports: [
    PurchasePlanComponent
  ]
})
export class PurchasePlanModule {}

