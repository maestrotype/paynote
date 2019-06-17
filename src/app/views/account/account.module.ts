import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AccountComponent} from './account.component';
import {AccountRoutingModule} from './account-routing.module';
import {SettingsModule} from '../settings/settings.module';
import {FundingSourcesModule} from '../funding-sources/funding-sources.module';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {TextMaskModule} from 'angular2-text-mask';
import {BillingModule} from '../../_shared_modules/billing/billing.module';
import {ApiManageModule} from '../../_shared_modules/api-manage/api-manage.module';
import {EmailSettingsModule} from '../../_shared_modules/email-settings/email-settings.module';
import {RecipientExperienceModule} from '../../_shared_modules/recipient-experience/recipient-experience.module';

// import {SafeHtmlPipe} from '../../_helpers/utility';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    AccountRoutingModule,
    ReactiveFormsModule,
    SettingsModule,
    FundingSourcesModule,
    PaginationModule,
    TooltipModule.forRoot(),
    TextMaskModule,
    BillingModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ApiManageModule,
    EmailSettingsModule,
    RecipientExperienceModule
  ],
  exports: [
    SettingsModule,
    FundingSourcesModule,
  ],
  declarations: [
    AccountComponent,
    // SafeHtmlPipe
  ]
})
export class AccountModule {}
