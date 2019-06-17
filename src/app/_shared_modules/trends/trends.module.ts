import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {TrendsComponent} from '../../views/trends/trends.component';
//import {PaginationModule} from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {ChartsModule} from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PaginationModule,
    ChartsModule

  ],
  declarations: [
    TrendsComponent
  ],
  exports: [
    TrendsComponent
  ]
})
export class TrendsModule {}

