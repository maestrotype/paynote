import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {MessageSuggestionComponent} from './message-suggestion.component';
import {MessageSuggestionRoutingModule} from './message-suggestion-routing.module';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { NgxEditorModule } from 'ngx-editor';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MessageSuggestionRoutingModule,
    PaginationModule,
    NgxEditorModule,
    MatTooltipModule
  ],
  declarations: [MessageSuggestionComponent]
})
export class MessageSuggestionModule { }
