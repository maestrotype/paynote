import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RecipientExperienceComponent} from '../../views/recipient-experience/recipient-experience.component';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  imports: [
    CommonModule,
    PaginationModule,
    FormsModule,
    ClipboardModule,
    MatCheckboxModule,
    ImageCropperModule
  ],
  declarations: [RecipientExperienceComponent],
  exports: [RecipientExperienceComponent]
})
export class RecipientExperienceModule { }
