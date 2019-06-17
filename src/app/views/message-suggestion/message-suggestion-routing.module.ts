import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {MessageSuggestionComponent} from './message-suggestion.component';

const routes: Routes = [
  {
    path: '',
    component: MessageSuggestionComponent,
    data: {
      title: 'message-suggestion'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageSuggestionRoutingModule {}
