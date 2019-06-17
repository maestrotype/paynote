import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {environment} from '../environments/environment';
import {map} from 'rxjs/operators';

declare var Fingerprint2: any;

@Injectable()
export class AuthenticationService {
  public token: string;
  public host: string;
  public headers: any;
  public browComponent: any = {};
  public objUser: any = {};


  constructor(private http: HttpClient, private router: Router) {          // set token if saved in local storage
    this.getInfoComponents();
    this.host = environment.host;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.objUser = currentUser;
  }

  login(username: string, password: string) {
    const ipClient = localStorage.getItem('ipClient') || null;
    return this.http.post(this.host + '/user/login', JSON.stringify(
      {
        email: username, password: password,
        fpb: this.getFingerPrintBrowser(),
        browser: this.browComponent,
        ipAddress: ipClient
      }
    ))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success && objResp.token) {
          localStorage.setItem('currentUser', JSON.stringify(objResp));
          return objResp;
        } else if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  sendVerifyPhoneCode(phone: string, email: string) {
    return this.http.post(this.host + '/user/phone/register', JSON.stringify({phone: phone, email: email}))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  sendVerifyCodeToEmail(email: string) {
    return this.http.post(this.host + '/user/email/verification/pincode', JSON.stringify({email: email}))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }
  sendVerifyPhoneCodeForAuthUser(u_token: string) {
    return this.http.post(this.host + '/user/mfa/verification', JSON.stringify({u_token: u_token}))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }
  sendVerifyPhoneCodeForNewUser(phone: any) {
    return this.http.post(this.host + '/user/phone/verify/initiate', JSON.stringify({phone: phone}))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  sendVerifyVoiceCode(u_token: any) {
    return this.http.post(this.host + '/user/merchant/voice/verification', JSON.stringify({u_token: u_token}))
      .pipe(map(response => {
        const objResp = <any>response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  verifyVoiceCode(u_token: string, phone_pin: string ) {
    return this.http.post(this.host + '/user/merchant/voice/verification/pincode', JSON.stringify({u_token: u_token, phone_pin: phone_pin}))
      .pipe(map(response => {
        const objResp = <any>response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  verifyPhoneCode(phone: string, email: string, code: string) {
    return this.http.post(this.host + '/user/phone/verify', JSON.stringify({phone: phone, email: email, phone_pin: code}))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  verifyEmailCode(email: string, code: string) {
    return this.http.post(this.host + '/user/email/verify', JSON.stringify({email: email, pin: code}))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  verifyPhoneCodeForAuthUser(u_token: string, code: string) {
    return this.http.post(this.host + '/user/mfa/verification/pincode', JSON.stringify({u_token: u_token, phone_pin: code}))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  login2FA(username: string, password: string, pinCode: string) {
    return this.http.post(this.host + '/user/login/mfa', JSON.stringify(
      {
        email: username, password: password, phone_pin: pinCode,
        fpb: this.getFingerPrintBrowser()
      }
    ))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          localStorage.setItem('currentUser', JSON.stringify(objResp));
          return true;
        }
        return false;
      }));
  }

  wpLogin(wp_auth_token: string) {
    return this.http.get(this.host + '/user/auth/' + wp_auth_token

    ).pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          localStorage.setItem('currentUser', JSON.stringify(objResp));
          return true;
        }
        return false;
      }));
  }


  retrieveUser(u_token: string) {
    return this.http.get(this.host + '/user/retrieve',
      {
        params:
          {
            u_token: u_token,
            fpb: this.getFingerPrintBrowser()
          }
      }
    );
  }

  retrieveUserLimits(u_token: string) {
    return this.http.get(this.host + '/user/merchant/remaining/limits',
      {
        params:
          {
            u_token: u_token,
            fpb: this.getFingerPrintBrowser()
          }
      }
    );
  }

  getFingerPrintBrowser() {
    if (localStorage.getItem('FPB')) {
      return localStorage.getItem('FPB');
    }

    return '';
  }

  getInfoComponents() {
    const options: any = {};
    const vm = this;
    Fingerprint2.get(options, function (components: any) {
      components.map(function (component: any) {
        switch (component.key) {
          case 'userAgent':
          case 'language':
          case 'timezoneOffset':
          case 'timezone':
          case 'platform':
            vm.browComponent[component.key] = component.value;
            break;
        }
      });
    });
  }

  retrieveMerchantRemainings(u_token: string) {
    return this.http.get(this.host + '/subscription/customer/remainings', {params: {u_token: u_token}});
  }

  retrieveDemoUser() {
    return this.http.get(this.host + '/user/login/demo');
  }

  signUp(userSignUp: any) {
    userSignUp.fpb = this.getFingerPrintBrowser();
    userSignUp.browser = this.browComponent;
    userSignUp.ipAddress = localStorage.getItem('ipClient') || null;
    return this.http.post(this.host + '/user/merchant/register', JSON.stringify(userSignUp));
  }

  sendBugReport(bugReport: object) {
    return this.http.post(this.host + '/user/bugreport/send', JSON.stringify(bugReport));
  }

  setupPassword(userPasswor: object) {
    return this.http.post(this.host + '/user/customer/client/setup-password', JSON.stringify(userPasswor));
  }
  createPasswordAndPhone(userPasswor: object) {
    return this.http.post(this.host + '/user/password/create', JSON.stringify(userPasswor));
  }

  setupPasswordAndPhone(userPasswor: object) {
    return this.http.post(this.host + '/user/password/phone/register', JSON.stringify(userPasswor));
  }

  signUpByPaymentLink(userSignUp: any) {
    userSignUp.fpb = this.getFingerPrintBrowser();
    userSignUp.browser = this.browComponent;
    return this.http.post(this.host + '/user/customer/client/register/payment-link', JSON.stringify(userSignUp));
  }

  signUpByInvoiceLink(userSignUp: any) {
    userSignUp.fpb = this.getFingerPrintBrowser();
    userSignUp.browser = this.browComponent;
    return this.http.post(this.host + '/check/invoice/payment/create/manual-verification', JSON.stringify(userSignUp));
  }
  initiateCreatePassword(userEmail: string) {
    return this.http.post(this.host + '/user/password/create/initiate', JSON.stringify({email: userEmail}));
  }

  recoveryPassword(userEmail: string) {
    return this.http.post(this.host + '/user/password/forget', JSON.stringify({email: userEmail}))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  resetPassword(passToken: string, newPass: string, confirmPass: string) {
    return this.http.post(this.host + '/user/password/recovery', JSON.stringify({token: passToken, password: newPass, cpassword: confirmPass}))
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }


  clearLogin() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminUser');
  }

  clearAdminLogin() {
    localStorage.removeItem('adminUser');
  }


  logout(action: string = ''): void {
    // clear token remove user from local storage to log user out
    if (action != '') {
      console.log(action);
    }
    this.token = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminUser');
    this.router.navigate(['/login']);
  }

  reLogin() {
    this.getUser()
      .subscribe(
        result => {
          if (result.success) {
            localStorage.setItem('currentUser', JSON.stringify(result));
          }
        },
        err => {
          this.router.navigate(['/login']);
        }
      );
  }

  refreshToken() {
    return this.http.get(this.host + '/auth/refresh')
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  getUser() {
    return this.http.get(this.host + '/user/auth', {params: {fpb: this.getFingerPrintBrowser()}})
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp;
        }
        return false;
      }));
  }

  getStatusCertifiedBeneficialOwner(u_token: string = '') {
    return this.http.get<any>(this.host + '/dwl/customer/beneficial-owner/status', {params: {u_token: u_token}})
      .pipe(map(response => {
        const objResp = <any> response;
        if (objResp.success) {
          return objResp.data.status;
        }
        return false;
      }));
  }
}
