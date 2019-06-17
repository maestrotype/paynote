import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {NumbersDirective} from '../../_helpers/utility';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [NumbersDirective],
  exports: [NumbersDirective]
})
export class DirectivesModule { }
