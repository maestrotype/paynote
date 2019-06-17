import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {ChartsComponent} from '../../views/charts/charts.component';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import {ChartsModule} from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PaginationModule,
    ChartsModule

  ],
  declarations: [
    ChartsComponent
  ],
  exports: [
    ChartsComponent
  ]
})
export class PaynoteChartsModule {}

