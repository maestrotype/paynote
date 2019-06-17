import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InvitationsComponent } from './invitations.component';
import { InvitationsRoutingModule } from './invitations-routing.module';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    InvitationsRoutingModule,
    PaginationModule,
    MatTooltipModule    
  ],
  declarations: [ InvitationsComponent ]
})
export class InvitationsModule { }
