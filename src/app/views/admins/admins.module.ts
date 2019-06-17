import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminsComponent } from './admins.component';
import { AdminsRoutingModule } from './admins-routing.module';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { FormsModule } from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { PasswordStrengthBarModule } from 'ng2-password-strength-bar';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
  imports: [
    CommonModule,
    AdminsRoutingModule,
    PaginationModule,
    FormsModule,
    MatSlideToggleModule,
    PasswordStrengthBarModule,
    TextMaskModule
  ],
  declarations: [AdminsComponent]
})
export class AdminsModule { }
