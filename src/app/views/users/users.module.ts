import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsersRoutingModule} from './users-routing.module';
import {UsersComponent} from './users.component';
import { FormsModule } from '@angular/forms';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material';
import {MatIconModule} from '@angular/material/icon';
import {PaynoteChartsModule} from '../../_shared_modules/charts/charts.module';

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,
    FormsModule,
    PaginationModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    PaynoteChartsModule
  ],
  declarations: [UsersComponent
//    PhonePipe
  ]
})
export class UsersModule { }
