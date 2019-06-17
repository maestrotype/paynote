import 'hammerjs';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable, ErrorHandler, Injector, InjectionToken } from '@angular/core';
import { LocationStrategy, CurrencyPipe, PathLocationStrategy, APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {NgProgressModule} from '@ngx-progressbar/core/';
import { NgProgressHttpModule } from '@ngx-progressbar/http';
import { NgProgressRouterModule } from '@ngx-progressbar/router';


import {MatStepperModule} from '@angular/material/stepper';
import {MatSelectModule} from '@angular/material/select';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {Uploader} from './_helpers/uploader/uploader';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule,
  MatNativeDateModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ClipboardModule } from 'ngx-clipboard';

import { AppComponent } from './app.component';

import { CookieService } from 'ngx-cookie-service';
import { AuthGuard} from './_guards/auth.guard';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { AuthenticationService } from './auth.service';
import { TextMaskModule } from 'angular2-text-mask';
import { PasswordStrengthBarModule } from 'ng2-password-strength-bar';
import { NgHttpLoaderModule } from 'ng-http-loader';
import {ToasterModule} from 'angular2-toaster';

// Import containers
import { DefaultLayoutComponent } from './containers';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';

const APP_CONTAINERS = [
  DefaultLayoutComponent
];

// Import routing module
import { AppRoutingModule } from './app.routing';
import { NavigationComponent } from './views/navigation/navigation.component';
import { SearchComponent } from './views/search/search.component';
import { LeftSidebarComponent } from './views/left-sidebar/left-sidebar.component';
import { NumbersDirective } from './_directives/numbers.directive';
import { DeleteConfirmDialogComponent } from './views/delete-confirm-dialog/delete-confirm-dialog.component';
import { SignUpComponent } from './views/sign-up/sign-up.component';
import { OnboardRegisterInDwollaComponent } from './views/onboard-register-in-dwolla/onboard-register-in-dwolla.component';
import { RecoveryPasswordComponent } from './views/recovery-password/recovery-password.component';
import { MerchantTransactionsComponent } from './views/merchant-transactions/merchant-transactions.component';
import { DigitalCheckComponent } from './views/digital-check/digital-check.component';
import { ConfirmDialogComponent } from './views/confirm-dialog/confirm-dialog.component';

import {Utility} from './_helpers/utility';
import {EqualValidator} from './_directives/validateEqual';
import {PaginationModule} from './ngx-pagination-bootstrap/dist';
import { TooltipModule } from 'ngx-bootstrap';
import { SignaturePadModule } from 'angular2-signaturepad';

import { ConfirmEmailComponent } from './views/confirm-email/confirm-email.component';
import { InvoiceFromCustomersComponent } from './views/invoice-from-customers/invoice-from-customers.component';
import { ThankYouPageComponent } from './views/thank-you-page/thank-you-page.component';
import { OnboardRegisterInSandboxComponent } from './views/onboard-register-in-sandbox/onboard-register-in-sandbox.component';
import { PasswordSetupComponent } from './views/password-setup/password-setup.component';
import { UserActionsComponent } from './views/user-actions/user-actions.component';
import { CreatePasswordComponent } from './views/create-password/create-password.component';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import { CreatePasswordSecureComponent } from './views/create-password-secure/create-password-secure.component';
import {PurchasePlanModule} from './_shared_modules/purchase-plan/purchase-plan.module';
import {environment} from '../environments/environment';

import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
    align: 'left',
    allowNegative: false,
    decimal: '.',
    precision: 2,
    prefix: '$ ',
    suffix: '',
    thousands: ','
};

import * as Rollbar from 'rollbar';
import { ExpressCheckoutComponent } from './views/express-checkout/express-checkout.component';

const rollbarConfig = {
  accessToken: '7b15950f71bc4ff88cb82a30c619a863',
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: '1.0.0',
        // Optionally have Rollbar guess which frames the error was thrown from
        // when the browser does not provide line and column numbers.
        guess_uncaught_frames: true
      }
    }
  }
};
@Injectable()
export class RollbarErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(err: any): void {
    if (environment.subDomen != 'paynote' ) {
      console.error(err);
      return;
    }

//    if( err.error.error == 'token_expired' ) {
//      console.error(err)
//      return
//    }
    const rollbar = this.injector.get(RollbarService);
    rollbar.error(err.originalError || err);
  }
}

export function rollbarFactory() {
    return new Rollbar(rollbarConfig);
}
export const RollbarService = new InjectionToken<Rollbar>('rollbar');
export function getBaseHref(platformLocation: PlatformLocation): string {
  return platformLocation.getBaseHrefFromDOM();
}

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatStepperModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTooltipModule,
    PaginationModule,
    TooltipModule.forRoot(),
    SignaturePadModule,
    TextMaskModule,
    MatSlideToggleModule,
    PasswordStrengthBarModule,
    NgHttpLoaderModule,
    PurchasePlanModule,
    ToasterModule.forRoot(),
    NgProgressModule,
    NgProgressHttpModule,
    NgProgressRouterModule,
    MatAutocompleteModule,
    ClipboardModule,
    CurrencyMaskModule
  ],
  declarations: [
    AppComponent,
    EqualValidator,
    NumbersDirective,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    RegisterComponent,
    NavigationComponent,
    SearchComponent,
    LeftSidebarComponent,
    DeleteConfirmDialogComponent,
    SignUpComponent,
    OnboardRegisterInDwollaComponent,
    RecoveryPasswordComponent,
    MerchantTransactionsComponent,
    DigitalCheckComponent,
    ConfirmDialogComponent,
    ConfirmEmailComponent,
    InvoiceFromCustomersComponent,
    ThankYouPageComponent,
    OnboardRegisterInSandboxComponent,
    PasswordSetupComponent,
    UserActionsComponent,
    CreatePasswordComponent,
    ResetPasswordComponent,
    CreatePasswordSecureComponent,
    ExpressCheckoutComponent
  ],
  providers: [
    AuthGuard,
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    AuthenticationService,
    Uploader,
    Utility,
    CookieService,
    CurrencyPipe,
    { provide: ErrorHandler, useClass: RollbarErrorHandler },
    { provide: RollbarService, useFactory: rollbarFactory },
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ],
  exports: [
    EqualValidator,
    NumbersDirective
  ],
  bootstrap: [ AppComponent ],
  entryComponents: [ ConfirmDialogComponent ]
})
export class AppModule { }
