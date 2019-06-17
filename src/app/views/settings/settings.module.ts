import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SettingsComponent} from './settings.component';
import {SettingsRoutingModule} from './settings-routing.module';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {SignaturePadModule} from 'angular2-signaturepad';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PaginationModule,
    SettingsRoutingModule,
    TooltipModule.forRoot(),
    SignaturePadModule,
    MatTooltipModule
  ],
  declarations: [SettingsComponent],
  exports: [SettingsComponent]
})
export class SettingsModule {}
