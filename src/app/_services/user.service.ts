import {Injectable} from '@angular/core';
import {AuthenticationService} from '../auth.service';
import {JqueryService} from './jquery.service';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {MessagesService} from './messages.service';
import {TopAlertsService} from './top-alerts.service';
import {DomSanitizer} from '@angular/platform-browser';
import {timer} from 'rxjs/observable/timer';

import * as moment from 'moment';
import * as momentTZ from 'moment-timezone';

declare var Fingerprint2: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // const STATUSES
  public STATUS_ACTIVE = 'Active';

  // const ROLES
  public ROLE_ADMIN = 'Admin';
  public ROLE_SUPER_ADMIN = 'SuperAdmin';
  public ROLE_MERCHANT = 'Merchant';
  public ROLE_CLIENT = 'Client';
  public ROLE_CUSTOMER = 'Customer';
  public ROLE_DEMO = 'Demo';

  private objUser: any = null;
  private objAdminUser: any;
  public isCertifiedBeneficialOwner = true;
  public isRequestCertifyBeneficialOwner = false;
  public isRequestVerifydBeneficialOwner = false;
  public isRequestAddBeneficialOwner = false;
  public isCanManageBeneficialOwner = false;
  public isGhostLogin = false;
  public isDemoLogin = false;
  public checkToProcessedPlan = true;
  public countMinSendRemaining = 3;
  public countMinReceivedRemaining = 3;
  public menu: any = [];
  public warningMessages: any = [];
  public lastActive = 0;
  public isExpressCheckout = false;
  public objPlanLimits: any = {};
  private hasReinitClient = true;
  private objLabels: any = {
    havePersonalSignupLock: false
  };
  public defaultSettings = {
    verified_personal: {
      receive_limit: {
        Daily: 2000,
        Invoices: 1000,
        Monthly: 15000
      },
      send_limit: {
        Checks: 1000,
        Daily: 2000,
        Monthly: 15000
      }
    },
    verified_business: {
      receive_limit: {
        Daily: 10000,
        Invoices: 2500,
        Monthly: 25000
      },
      send_limit: {
        Checks: 2500,
        Daily: 10000,
        Monthly: 25000
      }
    },
    unverified: {
      receive_limit: {
        Weekly: 5000
      },
      send_limit: {}
    }
  };

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private cookieService: CookieService,
    private jqueryService: JqueryService,
    public messages: MessagesService,
    private sanitizer: DomSanitizer,
    public topAlertsService: TopAlertsService
  ) {

    if (localStorage.getItem('currentUser') || localStorage.getItem('adminUser')) {
      this.reInitClient(this.initUser());
      this.checkCertifiedBeneficialOwner();

      const timerReInitUser = timer(5000, 10000);
      timerReInitUser.subscribe(() => {this.initUser(); });
      if (!this.isAdmin() && !this.isSuperAdmin() ) {
        const timerReLoginClient = timer(15000, 60000);
        timerReLoginClient.subscribe(() => {this.reInitClient(); } );
        this.retrieveUserLimits();
      }
    }
    this.lastActive = Date.now();
  }

  clearUser() {
    this.objUser = {};
  }

  initUser( bRedirect: boolean = false ) {
    if (localStorage.getItem('adminUser')) {
      this.objAdminUser = JSON.parse(localStorage.getItem('adminUser'));
      if (this.objAdminUser.success) {
        this.isGhostLogin = true;
      } else {
        this.isGhostLogin = false;
        localStorage.removeItem('adminUser');
      }
    } else {
      this.isGhostLogin = false;
    }
    if (localStorage.getItem('currentUser') && localStorage.getItem('currentUser') != '{}'
      && localStorage.getItem('currentUser') != 'null') {
      this.objUser = JSON.parse(localStorage.getItem('currentUser'));

      if (this.isLocked() && !this.isGhostLogin) {
        this.logout();
        return;
      }

      this.initMicroDeposit();
      this.initRequireBenefisiarOwners();
      this.initBussinesAccount();
      this.setTokenInCookies();
      this.initVerifyBankAccount();
      this.initLabels();
    }

    if (!this.objUser || !this.objUser.user) {
      return;
    }



    if (this.isSuperAdmin() || this.isAdmin() ) {
      localStorage.removeItem('sandBoxMode');
    }

    if (!this.objUser.user && !this.isExpressCheckout) {
      console.log('if( !this.objUser.user ) {');
      this.authenticationService.logout();
      return;
    }
    this.initMenu();

    if (bRedirect) {
      const redirectFromGhostMode = localStorage.getItem('redirectFromGhostMode');
      if (redirectFromGhostMode && !this.isGhostLogin ) {
        localStorage.removeItem('redirectFromGhostMode');
        this.redirectJustSimple(redirectFromGhostMode );
      } else {
        this.redirectLoginedUser();
      }
    }
  }

  retrieveUserLimits() {
    if ( !this.isMerchant() ) {
      return;
    }
    this.authenticationService.retrieveUserLimits( this.getToken() )
      .subscribe(
         response => {
          this.objPlanLimits = response;
          this.initLimits();
        }
      );
  }

  initLimits() {
    // limits:
    //   receive_daily: 0
    //   receive_enabled: 1
    //   receive_limit_daily: 2000
    //   receive_limit_invoices: 2000
    //   receive_limit_monthly: 15000
    //   receive_monthly: 736.6800000000001
    //   send_daily: 0
    //   send_enabled: 1
    //   send_limit_checks: 500
    //   send_limit_daily: 2000
    //   send_limit_monthly: 15000
    //   send_monthly: 44.32
    this.objPlanLimits.alarm = false;
    this.objPlanLimits.alarmMessage = '';
    if ( this.objPlanLimits.limits.receive_daily >= this.objPlanLimits.limits.receive_limit_daily ) {
      this.objPlanLimits.alarm = true;
      this.objPlanLimits.alarmMessage += 'Receive Daily Limit limit reached, please <a href="mailto:paynote@seamlesschex.com">contact support</a><br>';
    }
    if ( this.objPlanLimits.limits.receive_monthly >= this.objPlanLimits.limits.receive_limit_monthly ) {
      this.objPlanLimits.alarm = true;
      this.objPlanLimits.alarmMessage += 'Receive Monthly Limit limit reached, please <a href="mailto:paynote@seamlesschex.com">contact support</a><br>';
    }

    if ( this.objPlanLimits.limits.send_daily >= this.objPlanLimits.limits.send_limit_daily ) {
      this.objPlanLimits.alarm = true;
      this.objPlanLimits.alarmMessage += 'Send Daily Limit limit reached, please <a href="mailto:paynote@seamlesschex.com">contact support</a><br>';
    }
    if ( this.objPlanLimits.limits.send_monthly >= this.objPlanLimits.limits.send_limit_monthly ) {
      this.objPlanLimits.alarm = true;
      this.objPlanLimits.alarmMessage += 'Send Monthly Limit limit reached, please <a href="mailto:paynote@seamlesschex.com">contact support</a><br>';
    }
  }

  initLabels() {
    if ( !this.objUser.user.labels ) {
      return;
    }
    if ( !this.objUser.user.labels.length ) {
      return;
    }
    const vm = this;
    this.objUser.user.labels.forEach(function (label: string) {
      if (label === 'Personal Signup Lock') {
        vm.objLabels.havePersonalSignupLock = true;
      }
    });
  }

  initMicroDeposit() {
    if (this.getMicroDeposit()) {
      this.warningMessages = [];
      const microDeposits = this.getMicroDeposit();
      for (const key in microDeposits) {
        const microDeposit = microDeposits[key];
        if (microDeposit.status == 'pending' || microDeposit.status == 'verified' || microDeposit.status == 'verify') {
          continue;
        }
        const tempObjMessage = {
          action: 'verify_funding_source',
          message: 'Verify the two micro-deposits credited to your ' + microDeposit.bank
            + ' account ending in ' + microDeposit.number + ' on ' + moment(microDeposit.date.date).format('MMM d')
            + ', or',
          data: microDeposit
        };
        this.warningMessages.push(tempObjMessage);
      }
    } else {
      this.warningMessages = [];
    }
  }

  initBussinesAccount() {
    if (this.isIndividualAccount() || this.isAdmin() || this.isSuperAdmin()) {
      return;
    }

    const objDwlCustomer = this.getDwollaCustomer();

    if ( !objDwlCustomer ) {
      return;
    }

    if (objDwlCustomer.dwl_customer && objDwlCustomer.dwl_customer._links) {
      if (objDwlCustomer.dwl_customer._links['beneficial-owners']) {
        this.isCanManageBeneficialOwner = true;
      }
    }
  }

  initRequireBenefisiarOwners() {
    if (this.isIndividualAccount()) {
      return;
    }
    this.isRequestCertifyBeneficialOwner = false;
    this.isRequestVerifydBeneficialOwner = false;
    this.isRequestAddBeneficialOwner = false;

    if (!this.objUser.user.dwl_require) {
      return false;
    }

    if (this.objUser.user.dwl_require && this.objUser.user.dwl_require.length) {
      const vm = this;
      this.objUser.user.dwl_require.forEach(function (require: string) {
        switch (require) {
          case 'verify-beneficial-owners':
            vm.isRequestVerifydBeneficialOwner = true;
            break;
          case 'certify-beneficial-ownership':
            vm.isRequestCertifyBeneficialOwner = true;
            break;
          case 'beneficial-owners':
            vm.isRequestAddBeneficialOwner = true;
            break;
        }
      });
    }
  }

  initVerifyBankAccount() {
    if ( !this.hasReinitClient ) {
      return;
    }
    if (this.isAdmin() || this.isSuperAdmin() || this.isClient() ) {
      return;
    }
    if ( !this.isHaveBankAccount() ) {
      return;
    }
    if (this.isHaveBankAccount() && this.isHaveVerifyBankAccount() ) {
      return;
    }

    if (this.isHaveBankAccount() && !this.isHaveVerifyBankAccount() && this.hasReinitClient ) {
      this.hasReinitClient = false;
      this.reInitClient();
      setTimeout(() => this.hasReinitClient = true, 10000);
    }
  }

  setTokenInCookies() {
    if (environment.isLocal) {
      this.cookieService.set('tkn', localStorage.getItem('currentUser'));
    } else if (environment.production || environment.isSandBoxMode) {
      this.cookieService.set('tkn', localStorage.getItem('currentUser'), 20, '/', '.seamlesschex.com');
    }
  }

  setFingerPrintBrowser() {
    const options = {};
    Fingerprint2.get(options, function (components: any) {
      let values = components.map(function (component: any) {return component.value; });
      const hash = Fingerprint2.x64hash128(values.join(''), 31);
      localStorage.setItem('FPB', hash);
      values = null;
    });
  }

  goToSandBoxMode() {
    localStorage.setItem('sandBoxMode', '1');
    window.location.reload();
  }

  goToLiveMode() {
    localStorage.setItem('sandBoxMode', '0');
    window.location.reload();
  }

  getDateFormat(date: string, format: string = 'MMM D, YYYY') {
    // for time response 'MMM D, YYYY hh:mm:ss A'
    // return moment(date).local().format(format);
    const dateUtc = moment.utc(date);
    return moment(dateUtc).local().format(format);
  }

  getTimeZone() {
    return momentTZ.tz.guess();
  }

  getCountFreeChecks() {
    const settings = this.getSettings();
    if (settings && settings.free_checks + 0 > 0) {
      return Number(settings.free_checks);
    }

    return 0;
  }

  getCountFreeReceivs() {
    const settings = this.getSettings();
    if (settings && settings.free_receive + 0 > 0) {
      return Number(settings.free_receive);
    }

    return 0;
  }

  getDefaultSettings() {
    if (this.isDwollaUnVerified()) {
      return this.defaultSettings.unverified;
    }

    return this.isIndividualAccount() ? this.defaultSettings.verified_personal : this.defaultSettings.verified_business;
  }

  getUser() {
    if (this.objUser.user) {
      return this.objUser.user;
    }
    return null;
  }

  getMicroDeposit() {
    return this.objUser.user.wait_microdeposits;
  }

  getUserRole() {
    if (this.objUser && this.objUser.user) {
      return this.objUser.user.role;
    }

    return '';
  }

  getToken() {
    if (!this.objUser || !this.objUser.user) {
      return false;
    }
    return this.objUser.user.u_token;
  }
  getSignature() {
    if (this.objUser.signature != '' || this.objUser.signature != null) {
      return this.objUser.signature;
    } else {
      return false;
    }
  }

  updateSignature(signature: string = '') {
    this.objUser.signature = signature;
    localStorage.setItem('currentUser', JSON.stringify(this.objUser));
    this.initUser();
  }

  getAuthToken() {
    return this.objUser.token;
  }

  getEmail() {
    return this.objUser.user.email;
  }

  getArrayNames() {
    return this.objUser.user.name.split(' ');
  }

  getFullName() {
    return this.objUser.user.name;
  }

  getFirstName() {
    return this.getArrayNames()[0];
  }

  getLastName() {
    const arrNames = this.getArrayNames();
    if (arrNames.length > 1) {
      return arrNames.slice(1, arrNames.length).join(' ');
    } else if ( !this.isIndividualAccount() ) {
      const objDwlCustomer = this.getDwollaCustomer();
      if (objDwlCustomer && objDwlCustomer.dwl_customer.last_name ) {
        return objDwlCustomer.dwl_customer.last_name;
      }

    }

    return '';
  }

  getDoingBusinessAs() {
    const objDwlCust = this.getDwollaCustomer();
    if (!objDwlCust ) {
      return this.getFullName();
    }

    return objDwlCust.dwl_customer.doing_business_as ? objDwlCust.dwl_customer.doing_business_as : objDwlCust.dwl_customer.business_name;
  }

  getPhone() {
    return this.objUser.user.phone;
  }

  getStatus() {
    return this.objUser.user.status;
  }

  getSettings() {
    if ( !this.objUser || !this.objUser.user || !this.objUser.user.settings) {
      return null;
    }
    return this.objUser.user.settings;
  }
  getRoleName() {
    let strRole = '';
    switch (this.getUserRole()) {
      case 'SuperAdmin':
      case 'Admin':
        strRole = 'Administrator';
        break;
      case '':
    }

    return strRole;
  }

  getAccountType() {
    if ( !this.isLogined() ) {
      return;
    }
    if (this.objUser.user.type == 'personal') {
      return 'Individual';
    }
    return this.objUser.user.type;
  }

  getAccountTypeOrigin() {
    return this.objUser.user.type;
  }

  getSubscription() {
    return this.objUser.subscriptions.length ? this.objUser.subscriptions[0] : null;
  }

  isHavePlan() {
    return this.getSubscription() ? true : false;
  }

  getDwollaStatus() {
    return this.objUser.user.dwl_status;
  }

  getDwollaStatusForClient() {
    let status = '';
    if (this.isMerchant()) {
      if (this.getDwollaStatus() === 'document') {
        status = this.isHaveDocumentInPending() ? 'Document Pending' : 'Document Requested';
      } else {
        status = this.getDwollaStatus();
      }
    }
    if (this.isClient()) {
      status = !this.isDwollaVerified() ? 'Receive only account' : 'Verified';
    }

    return status;
  }

  getDwollaCustomer() {
    if (this.objUser.dwl_customer) {
      return this.objUser.dwl_customer;
    }

    return null;
  }

  getDwollaVerificationDocumentsNeeded() {
    if (!this.getDwollaCustomer()) {
      return null;
    }

    return this.getDwollaCustomer().dwl_customer.verification_documents_needed ?
      this.getDwollaCustomer().dwl_customer.verification_documents_needed : null;
  }

  getMinSendAmount() {
    const settings = this.getSettings();
    const plan = this.getSubscription();
    if ((settings && settings.free_checks > 0) || !plan ) {
      return 1;
    }

    if (plan && plan.remaining.send.over > 0 ) {
      return plan.remaining.send.over * 2;
    }

    return 6;
  }

  getMinRequestAmount() {
    const settings = this.getSettings();
    if (settings && settings.receive_limit && settings.receive_limit.transaction_fee) {
      const fee = Number(settings.receive_limit.transaction_fee) + 1;
      return fee * 2;
    }
    return 2;
  }

  getCountBankAccount() {
    return this.objUser.count_bank_accounts || 0;
  }

  getUserApiId() {
    return this.objUser.user.ext_app_id || null;
  }

  isEnable2FA() {
    const settings = this.getSettings();
    if (!settings) {
      return true;
    }

    return settings.twofa == undefined || settings.twofa == 1;
  }

  isApiSandBoxMode() {
    return localStorage.getItem('sandBoxMode') && localStorage.getItem('sandBoxMode') === '1';
  }

  isHaveApiApp() {
    return this.objUser.user.ext_app_id ? true : false;
  }

  isHaveReachedLimits() {
    return this.objPlanLimits.alarm;
  }

  isLogined() {
    if (!this.objUser) {
      return false;
    }
    return this.objUser.user ? true : false;
  }
  isLocked() {
    return this.objUser.user && this.objUser.user.status == 'Locked' ? true : false;
  }

  isAdmin() {
    return this.getUserRole() == this.ROLE_ADMIN;
  }

  isSuperAdmin() {
    return this.getUserRole() == this.ROLE_SUPER_ADMIN;
  }

  isMerchant() {
    return this.getUserRole() == this.ROLE_MERCHANT || this.getUserRole() == this.ROLE_DEMO;
  }

  isClient() {
    return this.getUserRole() == this.ROLE_CLIENT;
  }

  isCustomer() {
    return this.getUserRole() == this.ROLE_CUSTOMER || this.getUserRole() == this.ROLE_CLIENT;
  }

  isDemoUser() {
    return this.getUserRole() == this.ROLE_DEMO;
  }

  isDwollaUnVerified() {
    return this.getDwollaStatus() == 'unverified' ? true : false;
  }
  isDwollaVerified() {
    return this.getDwollaStatus() == 'verified' ? true : false;
  }
  isDwollaRetry() {
    return this.getDwollaStatus() == 'retry' ? true : false;
  }
  isDwollaSuspended() {
    return this.getDwollaStatus() == 'suspended' ? true : false;
  }
  isDwollaDocument() {
    return this.getDwollaStatus() == 'document' ? true : false;
  }
  isDwollaNeedControllerId() {
    return this.getDwollaVerificationDocumentsNeeded() == 'verify-with-document' ? true : false;
  }
  isDwollaNeedControllerIdAndBusinessDoc() {
    return this.getDwollaVerificationDocumentsNeeded() == 'verify-controller-and-business-with-document' ? true : false;
  }
  isDwollaNeedBusinessDoc() {
    return this.getDwollaVerificationDocumentsNeeded() == 'verify-business-with-document' ? true : false;
  }

  isDwollaNeedUploadBusDoc() {
    return this.isDwollaNeedControllerId() || this.isDwollaNeedBusinessDoc() || this.isDwollaNeedControllerIdAndBusinessDoc() ? true : false;
  }

  isPasswordSet() {
    const settings = this.getSettings();
    if (settings == null) {
      return true;
    }

    if (settings.password_setup == undefined || settings.password_setup == null) {
      return true;
    }
    return settings.password_setup == 1;
  }

  isController() {
    if (!this.objUser || !this.objUser.dwl_customer) {
      return false;
    }
    return this.objUser.dwl_customer.dwl_customer.controller ? true : false;
  }

  isIndividualAccount() {
    return this.getAccountType() == 'Individual' ? true : false;
  }

  isFilledInfoForDwolla() {
    const settings = this.getSettings();
    if (settings && !settings.filled_info) {
      return false;
    }

    return true;
  }

  isEmailConfirmation() {
    const settings = this.getSettings();
    if (settings && !settings.email_confirmation) {
      return false;
    }

    return true;
  }

  isHaveVerifyBankAccount() {
    if (!this.isHaveBankAccount()) {
      return false;
    }

    const objBankAccount = this.objUser.accounts[0];
    if (objBankAccount.status == 'unverified') {
      return false;
    }

    return true;
  }

  isHaveDocumentInPending() {
    const settings = this.getSettings();
    if (settings && settings.document_status && settings.document_status == 'pending') {
      return true;
    }

    return false;
  }

  isHaveBankAccount() {
    return this.objUser.accounts && this.objUser.accounts.length ? true : false;
  }

  isNotCertifiedBeneficialOwner() {
    if (this.isIndividualAccount()) {
      return true;
    }

    if (!this.isController()) {
      return true;
    }

    return this.isCertifiedBeneficialOwner;
  }

  isSendEnabled() {
    if (this.isAdmin() || this.isSuperAdmin() ) {
      return true;
    }
    const settings = this.getSettings();
    if (settings && settings.send_limit && settings.send_limit.Enabled == 1) {
      return true;
    }

    return false;
  }

  isRequestEnabled() {
    if (this.isAdmin() || this.isSuperAdmin() ) {
      return true;
    }

    const settings = this.getSettings();
    if (settings && settings.receive_limit && settings.receive_limit.Enabled == 1) {
      return true;
    }

    return false;
  }

  isPaymentLinkEnabled() {
    if (this.isAdmin() || this.isSuperAdmin() ) {
      return true;
    }

    const settings = this.getSettings();
    if ( settings && settings.billing_link ) {
      return true;
    }

    return false;
  }

  isAdditionalVerificationRequired() {
    if ( this.isIndividualAccount() ) {
      return false;
    }

    const settigs = this.getSettings();
    if (settigs.additional_voice_verification && settigs.additional_voice_verification == 1 ) {
      return false;
    }

    const emailInfo = this.getEmailInfo();
    if ( !emailInfo ) {
      return false;
    }

    return emailInfo.is_free ? true : false;
  }

  isPlanPaymentFailed() {
    if (!this.isMerchant() ) {
      return false;
    }
    const settings = this.getSettings();
    if ( settings && settings.plan_payment_failed == 1 ) {
      return true;
    }

    return false;
  }

  isPersonalSignupApprove() {
    if (this.isAdmin() || this.isSuperAdmin() ) {
      return true;
    }

    const settings = this.getSettings();
    if ( settings && settings.personal_signup_approve == 1 ) {
      return true;
    }

    return false;
  }

  isHavePersonalSignupLock() {
    return this.objLabels.havePersonalSignupLock;
  }

  canVoidCheck() {
    return this.isSuperAdmin() || this.isAdmin() || this.isMerchant() || this.isClient();
  }

  canTransferToBank() {
    if (this.objUser.user.disable_transfer_to_bank === 1 ) {
      return false;
    }

    return true;
  }

  logout() {
    this.objUser = null;
    this.authenticationService.logout();
  }

  reLogin() {
    return this.authenticationService.reLogin();
  }

  getDwlToken() {
    return this.objUser.user.dwl_token;
  }

  getEmailInfo() {
    return this.objUser.email_info;
  }

  isRegisterInDwl() {
    if (this.getDwlToken() == '' || this.getDwlToken() == null) {
      return false;
    }

    return true;
  }

  ghostLogin(u_token: string) {
    localStorage.setItem('redirectFromGhostMode', window.location.pathname);
    this.jqueryService.isInitMenu = false;
    this.jqueryService.os_init_mobile_link();
    this.authenticationService.retrieveUser(u_token)
      .subscribe(
        response => {
          const objGhostUser: any = response;
          if (objGhostUser) {
            objGhostUser.token = this.getAuthToken();
            localStorage.setItem('adminUser', localStorage.getItem('currentUser'));
            localStorage.setItem('currentUser', JSON.stringify(objGhostUser));
            this.isGhostLogin = true;
            this.initUser(true);
            this.retrieveUserLimits();
          }
        }
      );
  }

  demoLogin() {
    this.authenticationService.retrieveDemoUser()
      .subscribe(
        response => {
          const objGhostUser: any = response;
          if (objGhostUser) {
            localStorage.setItem('adminUser', '');
            localStorage.setItem('currentUser', JSON.stringify(objGhostUser));
            this.isDemoLogin = true;
            this.initUser(true);
          }
        }
      );
  }

  backToSuperAdmin() {
    localStorage.removeItem('sandBoxMode');
    localStorage.setItem('currentUser', localStorage.getItem('adminUser'));
    localStorage.removeItem('adminUser');
    this.initUser(true);
    this.isGhostLogin = false;
    this.isDemoLogin = false;
    this.lastActive = Date.now();

    setTimeout(() => this.jqueryService.initInterface(), 2000);
  }

  redirectLoginedUser() {
    if (this.isSuperAdmin() || this.isAdmin()) {
      this.router.navigateByUrl('/users');
    }

    if (this.isMerchant()) {
      this.router.navigateByUrl('/transactions');
    }

    if (this.isCustomer()) {
      this.router.navigateByUrl('/transactions');
    }
  }

  redirectJustSimple(strUrl: string = null, bHasParams: boolean = false, objParams: any = {}) {
    if (strUrl) {
      if (!bHasParams) {
        this.router.navigateByUrl(strUrl);
      } else {
        //        this.router.navigateByUrl(strUrl)
        this.router.navigate([strUrl, objParams], {replaceUrl: true});
      }
    }
  }

  canSwitchToSandBox() {
    if (this.isMerchant() && environment.canSwitchToSandBox && !this.isDemoUser()) {
      return true;
    }

    return false;
  }

  canSwitchToLive() {
    if (!environment.canSwitchToSandBox && this.isMerchant() && !this.isDemoUser()) {
      return true;
    }

    return false;
  }

  canSignUpToLive() {
    if (this.isSandBoxMode() && this.isDemoUser()) {
      return true;
    }

    return false;
  }

  canSendAction() {
    if (!this.checkToProcessedPlan) {
      return true;
    }

    if (this.getCountFreeChecks() > 0) {
      return true;
    }

    if (this.isSubscriptionPaid() ) {
      return true;
    }

    return false;
  }

  canRequestAction() {
    if (!this.checkToProcessedPlan) {
      return true;
    }

    if (this.getCountFreeReceivs() > 0) {
      return true;
    }

    if (this.isSubscriptionPaid() ) {
      return true;
    }

    return false;
  }
  canPaymentLinkAction() {
    if (!this.checkToProcessedPlan) {
      return true;
    }

    if (this.getCountFreeReceivs() > 0) {
      return true;
    }

    if (this.isSubscriptionPaid() ) {
      return true;
    }

    return false;
  }

  isSubscriptionPaid() {
    if ( !this.isMerchant() ) {
      return false;
    }

//    let plan = this.getSubscription()
//    if (plan && plan.status == 'processed') {
//      return true
//    }

    return this.objUser.subscription_active;
  }

  isSandBoxMode() {
    return environment.isSandBoxMode;
  }

  isNeedToProcessBeneficiar() {
    return this.isRequestAddBeneficialOwner || this.isRequestVerifydBeneficialOwner || this.isRequestCertifyBeneficialOwner;
  }

  checkAvailableActions(action: string = '', strUrlRedirect: string = '') {
    localStorage.removeItem('redirect_url_after');
    if (strUrlRedirect.length) {
      localStorage.setItem('redirect_url_after', strUrlRedirect);
    }

    if (this.isHavePersonalSignupLock() ) {
      return false;
    }

    if (this.isMerchant() && !this.isEmailConfirmation() && this.getCountFreeChecks() == 0) {
      this.jqueryService.showModal('.alert-verify-email-modal', {backdrop: 'static', keyboard: false, showClose: true});
      return false;
    }

    if ( ( this.isMerchant() || this.isClient() ) && !this.isFilledInfoForDwolla() && action == 'purchasePlan') {
      console.log('checkpoint 3333');
      this.jqueryService.showModal('.onboarding-in-dwolla-modal', {backdrop: 'static', keyboard: false});
      return false;
    }

    if (this.isClient() && !this.isPasswordSet() && (action == 'purchasePlan' || action == 'addBankAccount' || action == 'saveAccount')) {
      console.log('checkpoint 1');
      this.jqueryService.showModal('.password-setup-modal', {backdrop: 'static', keyboard: false, showClose: true});
      return false;
    }

    if (this.isMerchant() && !this.isHaveBankAccount() && (action == 'purchasePlan' || action == 'payAcceptTransfer')) {
      console.log('checkpoint 3344');
      this.jqueryService.showModal('.funding-source-setup-modal', {backdrop: 'static', keyboard: false});
      return false;
    }

    if ((this.isMerchant() || this.isClient()) && !this.isHaveVerifyBankAccount() && (action == 'purchasePlan' || action == 'payAcceptTransfer')) {
      console.log('checkpoint 2');
      this.jqueryService.onClick('#verify_funding_source');
      return false;
    }

    if (this.isMerchant() && action == 'dwollaRetry') {
      console.log('checkpoint 33');
      this.jqueryService.showModal('.onboarding-in-dwolla-modal', {backdrop: 'static', keyboard: false});
      return false;
    }

    if (this.isMerchant() && action == 'dwollaDocument') {
      console.log('checkpoint 333');
      this.redirectJustSimple('/account/documents');
      return false;
    }

    if ((this.isMerchant() || this.isClient()) && !this.isFilledInfoForDwolla() && action == 'purchasePlan') {
      console.log('checkpoint 3');
      this.jqueryService.showModal('.onboarding-in-dwolla-modal', {backdrop: 'static', keyboard: false});
      return false;
    }

    if (this.isClient() && this.isHaveVerifyBankAccount() && action == 'purchasePlan') {
      if (this.getCountFreeChecks() > 0 && strUrlRedirect == '/send-money') {
        return true;
      }
      console.log('checkpoint 4');
      this.jqueryService.showPurchasePlanModal();
      return false;
    }

    if (this.isMerchant() && !this.isHavePlan() && action == 'purchasePlan') {
      if (this.getCountFreeChecks() > 0 && strUrlRedirect == '/send-money') {
        return true;
      }
      if (this.getCountFreeReceivs() > 0 && strUrlRedirect == '/receive-money') {
        return true;
      }

      if (!this.isIndividualAccount() && this.isController() && this.isNeedToProcessBeneficiar()) {
        this.jqueryService.showModal('.alert-process-beneficiar-modal', {backdrop: 'static', keyboard: false});
        return false;
      }

      console.log('checkpoint 5');
      this.jqueryService.showPurchasePlanModal();
      return false;
    }

    return true;
  }

  reInitClient(callback: any = null) {
    if (!this.isLogined() || !localStorage.getItem('currentUser')) {
      return;
    }
    if (this.isGhostLogin) {
      this.authenticationService.retrieveUser(this.getToken())
        .subscribe(
          response => {
            const objGhostUser: any = response;
            if (objGhostUser) {
              objGhostUser.token = this.getAuthToken();
              localStorage.setItem('currentUser', JSON.stringify(objGhostUser));
            }
          }
        );
    } else {
      this.reLogin();
    }
    setTimeout(() => this.initUser(), 800);
    if (callback) {
      setTimeout(() => callback(), 1000);
    }
  }

  refreshClient() {
    if (!this.getAuthToken() || !this.objUser) {
      return;
    }
    this.authenticationService.refreshToken().subscribe(
      response => {
        if (response.success) {
          localStorage.setItem('currentUser', JSON.stringify(response));
        }
      }
    );
  }

  canProcessChecks(strTypeCheck: string = '') {
    if ((strTypeCheck == 'send-money' || strTypeCheck == 'send-mass-payouts') && (!this.isSendEnabled() || !this.canSendAction()) ) {
      return false;
    }

    if (strTypeCheck == 'receive-money' && (!this.isRequestEnabled() || !this.canRequestAction() ) ) {
      return false;
    }

    if (strTypeCheck == 'payment_link' && (!this.isPaymentLinkEnabled() || !this.canPaymentLinkAction() ) ) {
      return false;
    }

    if ((strTypeCheck == 'send-money' || strTypeCheck == 'send-mass-payouts' ) && this.getCountFreeChecks() > 0
      && this.isMerchant() && this.isDwollaVerified()) {
      return true;
    }

    if ((strTypeCheck == 'send-money' || strTypeCheck == 'send-mass-payouts' ) && this.getCountFreeChecks() > 0
      && this.isClient() && this.isHaveVerifyBankAccount()) {
      return true;
    }

    if ((strTypeCheck == 'receive-money' || strTypeCheck == 'payment_link') && this.getCountFreeReceivs() > 0
      && this.isMerchant() && this.isDwollaVerified()) {
      return true;
    }

    if ( (strTypeCheck == 'receive-money' || strTypeCheck == 'payment_link') && this.getCountFreeReceivs() > 0
      && this.isClient() && this.isHaveVerifyBankAccount()) {
      return true;
    }

    if (this.isMerchant() && this.isHavePlan() && this.isDwollaVerified()) {
      return true;
    }

    return false;
  }

  showUserMessage(messageID: string = '', messageType: string = 'error', messageTitle: string = 'Error' ) {
    this.topAlertsService.popToast(messageType, messageTitle, this.messages.get(messageID));
    return false;
  }

  getUserCheckingActionForSend(strUrlRedirect: string = '') {

    if (this.isMerchant() && this.isDwollaRetry()) {
      return 'this.userService.checkAvailableActions("dwollaRetry")';
    }

    if (this.isMerchant() && this.isDwollaSuspended()) {
      return 'this.userService.checkAvailableActions("dwollaSuspended")';
    }

    if (this.isMerchant() && this.isDwollaDocument()) {
      return 'this.userService.checkAvailableActions("dwollaDocument")';
    }

    if (!this.isHaveBankAccount() || !this.isHaveVerifyBankAccount() ) {
      return 'this.userService.checkAvailableActions("payAcceptTransfer")';
    }

    if ( this.canSendAction() && !this.isSendEnabled() ) {
      return 'this.userService.showUserMessage("CLIENT_SEND_DISABLED")';
    }




    if (!this.isMerchant() || !this.isHavePlan()) {
      return 'this.userService.checkAvailableActions("purchasePlan", "' + strUrlRedirect + '")';
    }

    if (!this.canSendAction() ) {
      return 'this.userService.showUserMessage("MESSAGE_PLAN_PAYMENT_IS_NOT_COMPLITED")';
    }
  }

  getUserCheckingActionForRequest(strUrlRedirect: string = '') {
    if (this.isMerchant() && this.isDwollaRetry()) {
      return 'this.userService.checkAvailableActions("dwollaRetry")';
    }

    if (this.isMerchant() && this.isDwollaDocument()) {
      return 'this.userService.checkAvailableActions("dwollaDocument")';
    }

    if (this.isMerchant() && this.isDwollaSuspended()) {
      return 'this.userService.checkAvailableActions("dwollaSuspended")';
    }

    if (!this.isHaveBankAccount() || !this.isHaveVerifyBankAccount() ) {
      return 'this.userService.checkAvailableActions("payAcceptTransfer")';
    }

    if (this.canRequestAction() && !this.isRequestEnabled() ) {
      return 'this.userService.showUserMessage("CLIENT_RECEIVE_DISABLED")';
    }

    if (!this.isMerchant() || !this.isHavePlan()) {
      return 'this.userService.checkAvailableActions("purchasePlan", "' + strUrlRedirect + '")';
    }

    if (!this.canRequestAction() ) {
      return 'this.userService.showUserMessage("MESSAGE_PLAN_PAYMENT_IS_NOT_COMPLITED")';
    }
  }

  getUserCheckingActionForPaymentLink(strUrlRedirect: string = '') {
    if (this.isMerchant() && this.isDwollaRetry()) {
      return 'this.userService.checkAvailableActions("dwollaRetry")';
    }

    if (this.isMerchant() && this.isDwollaDocument()) {
      return 'this.userService.checkAvailableActions("dwollaDocument")';
    }

    if (this.isMerchant() && this.isDwollaSuspended()) {
      return 'this.userService.checkAvailableActions("dwollaSuspended")';
    }

    if (!this.isHaveBankAccount() || !this.isHaveVerifyBankAccount() ) {
      return 'this.userService.checkAvailableActions("payAcceptTransfer")';
    }

    if (this.canPaymentLinkAction() && !this.isPaymentLinkEnabled() ) {
      return 'this.userService.showUserMessage("CLIENT_PAYMENT_PAGE_DISABLED")';
    }

    if (!this.isMerchant() || !this.isHavePlan()) {
      return 'this.userService.checkAvailableActions("purchasePlan", "' + strUrlRedirect + '")';
    }

    if (!this.canRequestAction() ) {
      return 'this.userService.showUserMessage("MESSAGE_PLAN_PAYMENT_IS_NOT_COMPLITED")';
    }
  }

  callAction(stringAction: string = '') {
    eval(stringAction);
  }

  checkCertifiedBeneficialOwner() {
    if (this.isIndividualAccount() || !this.isController()) {
      return;
    }
    this.authenticationService.getStatusCertifiedBeneficialOwner(this.getToken())
      .subscribe(
        status => {
          if (status) {
            if (status == 'recertify' || status == 'uncertified') {
              this.isCertifiedBeneficialOwner = false;
            } else {
              this.isCertifiedBeneficialOwner = true;
            }
          } else {
            this.isCertifiedBeneficialOwner = true;
          }
        }
      );
  }

  labelIsSameFingerprint(label: string = '') {
    if (label && label.indexOf('Fingerprint') >= 0) {
      return true;
    }

    return false;
  }

  labelIsSameBank(label: string = '') {
    if (label && label.indexOf('Same Bank') >= 0) {
      return true;
    }

    return false;
  }

  labelIsSameIp(label: string = '') {
    if (label && label.indexOf('Same IP') >= 0) {
      return true;
    }

    return false;
  }

  labelIsNotForShowInPopup(label: string = '') {
    return !this.labelIsSameFingerprint(label) && !this.labelIsSameBank(label) && !this.labelIsSameIp(label);
  }

  clearLocalStorageById( strLSName: string = '' ) {
    localStorage.removeItem( strLSName );
  }

//  ***************************** MENU ITEMS *****************************

  initMenu() {
    this.menu = [
      {
        name: 'Dashboard Analytics',
        iconClasses: 'picons-thin-icon-thin-0377_screen_analytics_pie_graph',
        image: false,
        src: '',
        sref: '/dashboard-analytics',
        subMenu: false,
        id: 'menuItemDashboardAnalytics',
        element_id: 'dashboardAnalytics',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Admins',
        iconClasses: 'picons-thin-icon-thin-0705_user_profile_security_password_permissions',
        image: false,
        src: '',
        sref: '/admins',
        subMenu: false,
        id: 'menuItemAdmin',
        element_id: 'admins',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Transactions',
        iconClasses: 'picons-thin-icon-thin-0409_wallet_credit_card_money_payment',
        image: false,
        src: '',
        sref: '/transactions',
        subMenu: false,
        id: 'menuItemTransactions',
        element_id: 'transactions',
        clickAction: 'this.userService.clearLocalStorageById("transactionsList")',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Dashboard',
        iconClasses: 'os-icon os-icon-layout',
        image: true,
        src: 'np-dashboard-205309-000000.svg',
        mobile_src: 'np-dashboard-205309-000000_1.svg',
        sref: '/transactions',
        subMenu: false,
        id: 'menuItemDashboard',
        element_id: 'dashboard',
        clickAction: 'this.userService.clearLocalStorageById("transactionsList")',
        permissionValue: this.isMerchant() || this.isCustomer(),
        menu: [{}]
      },
      {
        name: 'Send a Check',
        title: this.isClient() ? this.messages.get('TEXT_FREE_CHECKS_FOR_INDIVIDUAL') : '',
        iconClasses: 'picons-thin-icon-thin-0428_money_payment_dollar_bag_cash',
        image: true,
        src: 'np-send-money-950868-000000.svg',
        mobile_src: 'np-send-money-950868-000000_1.svg',
        subMenu: false,
        id: 'menuItemSendCheck',
        sref: this.canProcessChecks('send-money') ? '/send-money' : this.sanitizer.bypassSecurityTrustResourceUrl('javascript:void(0)'),
        clickAction: this.canProcessChecks('send-money')
          ? 'this.userService.clearLocalStorageById("paymentLinks")'
          : this.getUserCheckingActionForSend('/send-money'),
        element_id: 'send_money',
        permissionValue: this.isMerchant() && !this.isDwollaSuspended() || this.isClient() && !this.isDwollaSuspended(),
        menu: [{}]
      },
      {
        name: 'Send Mass Payouts',
        title: this.isClient() ? this.messages.get('TEXT_FREE_CHECKS_FOR_INDIVIDUAL') : '',
        iconClasses: 'picons-thin-icon-thin-0428_money_payment_dollar_bag_cash',
        image: true,
        src: 'np-send-money-991342-000000.svg',
        mobile_src: 'np-send-money-991342-000000_1.svg',
        subMenu: false,
        id: 'menuItemSendMassPayouts',
        sref: this.canProcessChecks('send-mass-payouts') ? '/send-mass-payouts' : this.sanitizer.bypassSecurityTrustResourceUrl('javascript:void(0)'),
        clickAction: this.canProcessChecks('send-mass-payouts') ? null : this.getUserCheckingActionForSend('/send-mass-payouts'),
        element_id: 'send_many_money',
        permissionValue: this.isMerchant() && !this.isDwollaSuspended() || this.isClient() && !this.isDwollaSuspended(),
        menu: [{}]
      },
      {
        name: 'Request a Check',
        iconClasses: 'picons-thin-icon-thin-0143_rotate_clockwise',
        image: true,
        src: 'np-send-money-950868-000001.svg',
        mobile_src: 'np-send-money-950868-000001_1.svg',
        sref: this.canProcessChecks('receive-money') ? '/receive-money' : this.sanitizer.bypassSecurityTrustResourceUrl('javascript:void(0)'),
        clickAction: this.canProcessChecks('receive-money')
          ? 'this.userService.clearLocalStorageById("paymentRequests")'
          : this.getUserCheckingActionForRequest('/receive-money'),
        subMenu: false,
        id: 'menuItemRequestCheck',
        element_id: 'request_check',
        permissionValue: this.isMerchant() && !this.isDwollaSuspended() || this.isClient() && !this.isDwollaSuspended(),
        menu: [{}]
      },
      {
        name: 'Payment Page',
        iconClasses: 'picons-thin-icon-thin-0143_rotate_clockwise',
        image: true,
        src: 'np-send-money-950868-000001.svg',
        mobile_src: 'np-send-money-950868-000001_1.svg',
        sref: this.canProcessChecks('payment_link') ? '/payment-page' : this.sanitizer.bypassSecurityTrustResourceUrl('javascript:void(0)'),
        clickAction: this.canProcessChecks('payment_link')
          ? 'this.userService.clearLocalStorageById("billingLinks")'
          : this.getUserCheckingActionForPaymentLink('/payment-page'),
        subMenu: false,
        id: 'menuItemPaymentLink',
        element_id: 'payment_link',
        permissionValue: (this.isMerchant() && !this.isDwollaSuspended() || this.isClient() && !this.isDwollaSuspended()),
        menu: [{}]
      },
      {
        name: 'Customers',
        iconClasses: 'np_image os-icon os-icon-users',
        image: false,
        src: '',
        sref: '/customers',
        subMenu: false,
        id: 'menuItemCustomers',
        element_id: 'customers',
        clickAction: 'this.userService.clearLocalStorageById("merchantCustomers")',
        permissionValue: this.isMerchant(),
        menu: [{}]
      },
      {
        name: 'Recurring Checks',
        iconClasses: 'np_image icon-feather-repeat',
        image: false,
        src: '',
        sref: '/recurring',
        subMenu: false,
        id: 'menuItemRecurring',
        element_id: 'recurring',
        permissionValue: this.isMerchant() && !this.isDwollaSuspended() || this.isCustomer() && !this.isDwollaSuspended(),
        menu: [{}]
      },
      {
        name: 'Account',
        iconClasses: 'os-icon os-icon-user',
        image: true,
        src: 'np-account-1488075-000000.svg',
        mobile_src: 'np-account-1488075-000000_1.svg',
        sref: '/account',
        subMenu: false,
        id: 'menuItemAccount',
        element_id: 'account',
        permissionValue: this.isMerchant() || this.isCustomer(),
        menu: [{}]
      },
      //      {
      //        name: 'Merchants',
      //        iconClasses: 'picons-thin-icon-thin-0703_users_profile_group_two',
      //        image:false,
      //        src:'',
      //        sref: '/merchants',
      //        subMenu: false,
      //        element_id: 'merchants',
      //        permissionValue: this.isAdmin() || this.isSuperAdmin() ? true : false,
      //        menu: [{}]
      //      },
      {
        name: 'Users',
        iconClasses: 'picons-thin-icon-thin-0703_users_profile_group_two menuItemUsers',
        image: false,
        src: '',
        sref: '/users',
        subMenu: false,
        id: 'menuItemUsers',
        element_id: 'users',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        clickAction: 'this.userService.clearLocalStorageById("usersList")',
        menu: [{}]
      },
      {
        name: 'Payments',
        iconClasses: 'picons-thin-icon-thin-0409_wallet_credit_card_money_payment',
        image: false,
        src: '',
        sref: '/payments',
        subMenu: false,
        id: 'menuItemPayments',
        element_id: 'payments',
        clickAction: 'this.userService.clearLocalStorageById("paymentsList")',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Email',
        iconClasses: 'picons-thin-icon-thin-0321_email_mail_post_at',
        image: false,
        src: '',
        subMenu: true,
        id: 'menuItemEmail',
        sref: this.sanitizer.bypassSecurityTrustResourceUrl('javascript:void(0)'),
        element_id: 'email',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [
          {
            name: 'Email Template',
            iconClasses: 'picons-thin-icon-thin-0316_email_mail_post_open',
            sref: '/mail-template',
            id: 'menuItemEmailTemplate',
            element_id: 'mail_template'
          },
          {
            name: 'Email History',
            iconClasses: 'picons-thin-icon-thin-0318_email_attachment',
            sref: '/mail-storage',
            id: 'menuItemEmailHistory',
            element_id: 'mail_storage'
          }
        ]
      },
      {
        name: 'Messages',
        iconClasses: 'picons-thin-icon-thin-0279_chat_message_comment_bubble',
        image: false,
        src: '',
        sref: '/messages',
        subMenu: false,
        id: 'menuItemMessages',
        element_id: 'messages',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Invitations',
        iconClasses: 'picons-thin-icon-thin-0394_business_handshake_deal_contract_sign',
        image: false,
        src: '',
        sref: '/invitations',
        subMenu: false,
        id: 'menuItemInvitations',
        element_id: 'invitations',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Plans',
        iconClasses: 'picons-thin-icon-thin-0100_to_do_list_reminder_done',
        image: false,
        src: '',
        sref: '/plans',
        subMenu: false,
        id: 'menuItemPlans',
        element_id: 'plans',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Funding Sources',
        iconClasses: 'picons-thin-icon-thin-0418_bank_pantheon',
        image: false,
        src: '',
        sref: '/funding-sources',
        subMenu: false,
        id: 'menuItemFundingSources',
        element_id: 'funding_sources',
        permissionValue: this.isSuperAdmin(),
        menu: [{}]
      },
      //      {
      //        name: 'View Our Plans',
      //        iconClasses: 'picons-thin-icon-thin-0014_notebook_paper_todo',
      //        image:false,
      //        src:'',
      //        sref: '/plans',
      //        subMenu: false,
      //        element_id: 'view_our_plans',
      //        permissionValue: this.isMerchant() ? true : false,
      //        menu: [{}]
      //      },
      {
        name: 'Payment Requests',
        iconClasses: 'picons-thin-icon-thin-0411_invoice_dollar_bill_payment',
        image: false,
        src: '',
        sref: '/request-payments',
        subMenu: false,
        id: 'menuItemPaymentRequests',
        element_id: 'request_payments',
        permissionValue: this.isDwollaVerified() && this.isCustomer(),
        menu: [{}]
      },
      //      {
      //        name: 'Billing',
      //        iconClasses: 'picons-thin-icon-thin-0411_invoice_dollar_bill_payment',
      //        image:false,
      //        src:'',
      //        sref: '/billing',
      //        subMenu: false,
      //        element_id: 'billing',
      //        permissionValue: this.isMerchant() ? true : false,
      //        menu: [{}]
      //      },
      {
        name: 'Subscriptions & Invoices',
        iconClasses: 'picons-thin-icon-thin-0411_invoice_dollar_bill_payment',
        image: false,
        src: '',
        sref: '/subscription',
        subMenu: false,
        id: 'menuItemSubscriptionsInvoices',
        element_id: 'subscriptions_invoices',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Campaign Statistics',
        iconClasses: 'fa fa-line-chart',
        image: false,
        src: '',
        sref: '/campaign-statistic',
        subMenu: false,
        id: 'menuItemCampaignStatistics',
        element_id: 'campaign_statistic',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Webhooks',
        iconClasses: 'picons-thin-icon-thin-0381_line_structure_relations_hierarchy',
        image: false,
        src: '',
        sref: '/webhooks',
        subMenu: false,
        id: 'menuItemWebhooks',
        element_id: 'webhooks',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Email Log',
        iconClasses: 'picons-thin-icon-thin-0316_email_mail_post_open',
        image: false,
        src: '',
        sref: '/email-log',
        subMenu: false,
        id: 'menuItemEmailLog',
        element_id: 'emailLog',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [{}]
      },
      {
        name: 'Settings',
        iconClasses: 'picons-thin-icon-thin-0052_settings_gears_preferences_gearbox',
        image: false,
        src: '',
        subMenu: true,
        id: 'menuItemSettings',
        sref: this.sanitizer.bypassSecurityTrustResourceUrl('javascript:void(0)'),
        element_id: 'settings',
        permissionValue: this.isAdmin() || this.isSuperAdmin(),
        menu: [
          {
            name: 'Block List',
            iconClasses: 'picons-thin-icon-thin-0059_error_warning_danger_stop',
            sref: '/settings',
            id: 'menuItemBlockList',
            element_id: 'block_list'
          },
          {
            name: 'Multiple Phone',
            iconClasses: 'picons-thin-icon-thin-0295_phone_hold_call',
            sref: '/multiple-phone',
            id: 'menuItemMultiplePhone',
            element_id: 'multiple_phone'
          },
          {
            name: 'Rules for Signup',
//            iconClasses: 'picons-thin-icon-thin-0706_user_profile_add_new',
            iconClasses: 'picons-thin-icon-thin-0004_pencil_ruler_drawing',
            sref: '/rules-for-signup',
            id: 'rules_for_signup',
            element_id: 'rules_for_signup'
          },
          {
            name: 'Rules for Transactions',
            iconClasses: 'picons-thin-icon-thin-0004_pencil_ruler_drawing',
            sref: '/rules-for-transactions',
            id: 'rules_for_transactions',
            element_id: 'rules_for_transactions'
          }
        ]
      },

    ];
    setTimeout(() => this.jqueryService.initLeftSideBarActions(), 500);
  }

}
