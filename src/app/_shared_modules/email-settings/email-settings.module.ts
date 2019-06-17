import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EmailSettingsComponent} from '../../views/email-settings/email-settings.component';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxEditorModule } from 'ngx-editor';

@NgModule({
  imports: [
    CommonModule,
    PaginationModule,
    FormsModule,
    ClipboardModule,
    MatCheckboxModule,
    ImageCropperModule,
    NgxEditorModule
  ],
  declarations: [EmailSettingsComponent],
  exports: [EmailSettingsComponent]
})
export class EmailSettingsModule { }
