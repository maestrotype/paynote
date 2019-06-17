import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './_guards/auth.guard';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';
import { SignUpComponent } from './views/sign-up/sign-up.component';
import { RecoveryPasswordComponent } from './views/recovery-password/recovery-password.component';
import { DigitalCheckComponent } from './views/digital-check/digital-check.component';
import { ConfirmEmailComponent } from './views/confirm-email/confirm-email.component';
import { InvoiceFromCustomersComponent } from './views/invoice-from-customers/invoice-from-customers.component';
import { ThankYouPageComponent } from './views/thank-you-page/thank-you-page.component';
import { CreatePasswordComponent } from './views/create-password/create-password.component';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import {ExpressCheckoutComponent} from './views/express-checkout/express-checkout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'login/:wp_auth_token',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'create-password',
    component: CreatePasswordComponent,
    data: {
      title: 'Create Password Page'
    }
  },
  {
    path: 'create-password/:create_password_token',
    component: CreatePasswordComponent,
    data: {
      title: 'Create Password Page'
    }
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    data: {
      title: 'Sign Up Page'
    }
  },
  {
    path: 'sign-up/:invite_code',
    component: SignUpComponent,
    data: {
      title: 'Sign Up Page'
    }
  },
  {
    path: 'recovery-password/:token_password',
    component: RecoveryPasswordComponent,
    data: {
      title: 'Recovery Password'
    }
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: {
      title: 'Reset Password'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    pathMatch: 'full',
    path: 'sandbox/check/:pay_token',
    component: DigitalCheckComponent,
    data: {
      title: 'Here\'s your Check',
      isSandbox: true
    }
  },
  {
    pathMatch: 'full',
    path: 'check/:pay_token',
    component: DigitalCheckComponent,
    data: {
      title: 'Here\'s your Check',
      isSandbox: false
    }
  },
  {
    path: 'sandbox/invoice/:invoice_token',
    component: InvoiceFromCustomersComponent,
    data: {
      title: 'Send Online Check',
      isSandbox: true
    }
  },
  {
    path: 'invoice/:invoice_token',
    component: InvoiceFromCustomersComponent,
    data: {
      title: 'Send Online Check',
      isSandbox: false
    }
  },
  {
    path: 'sandbox/checkout/:checkout_token',
    component: InvoiceFromCustomersComponent,
    data: {
      title: 'Send Online Check',
      isSandbox: true
    }
  },
  {
    path: 'checkout/:checkout_token',
    component: InvoiceFromCustomersComponent,
    data: {
      title: 'Send Online Check',
      isSandbox: false
    }
  },
  {
    path: 'express-checkout/:base64_token',
    component: ExpressCheckoutComponent,
    data: {
      title: 'Express Send Online Check',
      isSandbox: false
    }
  },
  {
    path: 'confirm-email/:confirm_token',
    component: ConfirmEmailComponent,
    data: {
      title: 'Confirm Email'
    }
  },
  {
    path: 'thank-you',
    component: ThankYouPageComponent,
    data: {
      title: 'Thank You'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Home'
    },
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: 'customers',
        loadChildren: './views/customers/customers.module#CustomersModule',
        data: {
          expectedRoles: ['Merchant', 'Demo']
        }
      },
      {
        path: 'customers/:id',
        loadChildren: './views/customer-detail/customer-detail.module#CustomerDetailModule',
        data: {
          expectedRoles: ['Merchant', 'Demo']
        }
      },

      {
        path: 'transaction',
        loadChildren: './views/dwolla-transactions/dwolla-transactions.module#DwollaTransactionsModule'
      },

      {
        path: 'transfer-money',
        loadChildren: './views/transfer-money/transfer-money.module#TransferMoneyModule'
      },
      {
        path: 'send-money',
        loadChildren: './views/send-money/send-money.module#SendMoneyModule',
        data: {
          expectedRoles: ['Merchant', 'Demo']
        }
      },
      {
        path: 'payment-page',
        loadChildren: './views/billing-link/billing-link.module#BillingLinkModule',
        data: {
          expectedRoles: ['Merchant', 'Demo']
        }
      },
      {
        path: 'receive-money',
        loadChildren: './views/request-check/request-check.module#RequestCheckModule',
        data: {
          expectedRoles: ['Merchant', 'Demo']
        }
      },
      {
        path: 'send-mass-payouts',
        loadChildren: './views/send-batch/send-batch.module#SendBatchModule',
        data: {
          expectedRoles: ['Merchant', 'Demo']
        }
      },

//      {
//        path: 'buttons',
//        loadChildren: './views/buttons/buttons.module#ButtonsModule'
//      },
//      {
//        path: 'charts',
//        loadChildren: './views/chartjs/chartjs.module#ChartJSModule'
//      },
      {
        path: 'dashboard',
        loadChildren: './views/dashboard/dashboard.module#DashboardModule'
      },

//      {
//        path: 'icons',
//        loadChildren: './views/icons/icons.module#IconsModule'
//      },
//      {
//        path: 'notifications',
//        loadChildren: './views/notifications/notifications.module#NotificationsModule'
//      },
//      {
//        path: 'theme',
//        loadChildren: './views/theme/theme.module#ThemeModule'
//      },
//      {
//        path: 'widgets',
//        loadChildren: './views/widgets/widgets.module#WidgetsModule'
//      }

      {
        path: 'account',
        loadChildren: './views/account/account.module#AccountModule',
        data: {
          expectedRoles: ['Merchant', 'Client', 'Customer', 'Demo']
        }
      },
      {
        path: 'recurring',
        loadChildren: './views/manage-recuring/manage-recuring.module#ManageRecuringModule',
        data: {
          expectedRoles: ['Merchant', 'Client', 'Customer', 'Demo']
        }
      },
      {
        path: 'account/:tab_name',
        loadChildren: './views/account/account.module#AccountModule',
        data: {
          expectedRoles: ['Merchant', 'Client', 'Customer', 'Demo']
        }
      },
      {
        path: 'account/:tab_name/:action',
        loadChildren: './views/account/account.module#AccountModule',
        data: {
          expectedRoles: ['Merchant', 'Client', 'Customer', 'Demo']
        }
      },
//      {
//        path: 'transactions',
//        loadChildren: './views/merchant-transactions/merchant-transactions.module#MerchantTransactionsModule'
//      },
      {
        path: 'transactions',
        loadChildren: './views/send-checks/send-checks.module#SendChecksModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin', 'Merchant', 'Client', 'Customer', 'Demo']
        }
      },
      {
        path: 'payments',
        loadChildren: './views/payments/payments.module#PaymentsModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'mail-template',
        loadChildren: './views/mail/mail.module#MailModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'multiple-phone',
        loadChildren: './views/multiple-phone/multiple-phone.module#RulesForSignupModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'mail-storage',
        loadChildren: './views/mail-history/mail-history.module#MailHistoryModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
//      {
//        path: 'merchants',
//        loadChildren: './views/merchants/merchants.module#MerchantsModule',
//        data: {
//          expectedRoles: ['Admin', 'SuperAdmin']
//        }
//      },
//      {
//        path: 'merchants/:dwl_token/:u_token',
//        loadChildren: './views/merchant-profile/merchant-profile.module#MerchantProfileModule',
//        data: {
//          expectedRoles: ['Admin', 'SuperAdmin']
//        }
//      },
      {
        path: 'users/:dwl_token/:u_token',
        loadChildren: './views/merchant-profile/merchant-profile.module#MerchantProfileModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'users',
        loadChildren: './views/users/users.module#UsersModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'account-settings',
        loadChildren: './views/settings/settings.module#SettingsModule'
      },
      {
        path: 'messages',
        loadChildren: './views/message-suggestion/message-suggestion.module#MessageSuggestionModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'invitations',
        loadChildren: './views/invitations/invitations.module#InvitationsModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'plans',
        loadChildren: './views/plans/plans.module#PlansModule',
        data: {
          expectedRoles: ['Merchant', 'Admin', 'SuperAdmin', 'Client', 'Customer', 'Demo']
        }
      },
      {
        path: 'invoice',
        loadChildren: './_shared_modules/invoice/invoice.module#InvoiceModule',
        data: {
          expectedRoles: ['Merchant', 'Client', 'Customer', 'Demo']
        }
      },
      {
        path: 'request-payments',
        loadChildren: './views/client-invoices/client-invoices.module#ClientInvoicesModule',
        data: {
          expectedRoles: ['Client', 'Customer', 'Demo']
        }
      },
      {
        path: 'subscription',
        loadChildren: './views/subscription/subscription.module#SubscriptionModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'funding-sources',
        loadChildren: './views/funding-sources/funding-sources.module#FundingSourcesModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'webhooks',
        loadChildren: './views/webhooks/webhooks.module#WebhooksModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'settings',
        loadChildren: './views/admin-settings/admin-settings.module#AdminSettingsModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'rules-for-signup',
        loadChildren: './views/rules-for-signup/rules-for-signup.module#RulesForSignupModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'rules-for-transactions',
        loadChildren: './views/rules-for-transactions/rules-for-transactions.module#RulesForTransactionsModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'admins',
        loadChildren: './views/admins/admins.module#AdminsModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'dashboard-analytics',
        loadChildren: './views/dashboard-analytics/dashboard-analytics.module#DashboardAnalyticsModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'billing',
        loadChildren: './_shared_modules/billing/billing.module#BillingModule',
        data: {
          expectedRoles: ['Merchant', 'Client', 'Customer', 'Demo']
        }
      },
      {
        path: 'campaign-statistic',
        loadChildren: './views/campaign-statistic/campaign-statistic.module#CampaignStatisticModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin']
        }
      },
      {
        path: 'email-log',
        loadChildren: './views/email-log/email-log.module#EmailLogModule',
        data: {
          expectedRoles: ['Admin', 'SuperAdmin', 'Merchant']
        }
      },
//      {
//        path: 'recurring',
//        loadChildren: './views/recurring/recurring.module#RecurringModule'
//      },
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'}) ],
  exports: [ RouterModule ],
//  declarations: [PurchasePlanComponent]
})
export class AppRoutingModule {}
