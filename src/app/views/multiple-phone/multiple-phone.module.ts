import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MultiplePhoneRoutingModule} from './multiple-phone-routing.module';
import {MultiplePhoneComponent} from './multiple-phone.component';
import { FormsModule } from '@angular/forms';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { TextMaskModule } from 'angular2-text-mask';
//import {PhonePipe} from '../../_helpers/utility'

@NgModule({
  imports: [
    CommonModule,
    MultiplePhoneRoutingModule,
    PaginationModule,
    FormsModule,
    TextMaskModule
  ],
  declarations: [MultiplePhoneComponent]
})
export class RulesForSignupModule { }
