import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSettingsComponent } from './admin-settings.component';
import { AdminSettingsRoutingModule } from './admin-settings-routing.module';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { FormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
  imports: [
    CommonModule,
    AdminSettingsRoutingModule,
    PaginationModule,
    FormsModule,
    TextMaskModule
    
  ],
  declarations: [AdminSettingsComponent]
})
export class AdminSettingsModule { }
