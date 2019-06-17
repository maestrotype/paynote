import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RulesForSignupRoutingModule} from './rules-for-signup-routing.module';
import {RulesForSignupComponent} from './rules-for-signup.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RulesForSignupRoutingModule,
    FormsModule
  ],
  declarations: [RulesForSignupComponent]
})
export class RulesForSignupModule { }
