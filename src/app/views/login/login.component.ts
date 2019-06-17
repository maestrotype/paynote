import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../auth.service';
import {ErrorService} from '../../_services/error.service';
import {UserService} from '../../_services/user.service';
import {JqueryService} from '../../_services/jquery.service';
import {environment} from '../../../environments/environment';
import {MessagesService} from '../../_services/messages.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  isErrorLogin = false;
  errorMessageLogin = '';
  showLoginForm = true;
  show2FAForm = false;
  showResetPassword = false;
  isSuccess2FA = false;
  successMessage2FA = '';
  isError2FA = false;
  errorMessage2FA = '';
  isSuccessLogin = false;
  isSuccessResetPas = false;
  successMessageLogin = '';
  successMessageResetPas = '';
  isErrorResetPas = false;
  isVisibleLoginForm = true;
  errorMessageResetPas = '';
  public wp_auth_token: string;

  constructor(
    private authenticationService: AuthenticationService,
    public errorService: ErrorService,
    public userService: UserService,
    public messages: MessagesService,
    public jqueryService: JqueryService,
    private router: ActivatedRoute,
  ) {}

  ngOnInit() {
    if (environment.subDomen === 'paynote' ) {
      this.authenticationService.clearLogin();
    }
    this.wp_auth_token = this.router.snapshot.paramMap.get('wp_auth_token');
    if (this.wp_auth_token) {
      this.isVisibleLoginForm = false;
      this.loginWordpress();
    } else {
      this.checkSandBoxDemoMode();
    }
    // reset login status
    this.jqueryService.removeSelector('.modal-backdrop.fade');
    this.jqueryService.removeSelector('.modal.fade.show.d-block');
    this.userService.setFingerPrintBrowser();
  }

  checkSandBoxDemoMode() {
    if ( environment.isSandBoxMode && localStorage.getItem('currentUser') ) {
      this.userService.initUser();
    } else {
      this.authenticationService.logout();
    }
  }

  clearMessages() {
    this.isErrorLogin = this.isSuccess2FA = this.isError2FA = false;
    this.errorMessageLogin = this.errorMessage2FA = this.successMessage2FA = '';
  }

  backToLogin() {
    this.showFormLogin();
  }

  login() {
    this.clearMessages();
    this.loading = true;
    this.authenticationService.login(this.model.username, this.model.password )
      .subscribe(
        result => {
          if ( result ) {
            if ( result.message && result.success ) {
              this.showForm2FA();
              this.isSuccess2FA = true;
              this.successMessage2FA = result.message;
              this.loading = false;
              if ( environment.subDomen !== 'demo' && environment.subDomen !== 'paynote' ) {
                this.autoLogin( result.message );
              }
            } else if ( result.success && result.token ) {
              this.userService.lastActive = Date.now();
              this.userService.initUser(true);
              this.userService.retrieveUserLimits();
            }
          } else {
            // login failed
            this.errorMessageLogin = this.messages.get('USERNAME_OR_PASSWORD_IS_INCORRECT');
            this.loading = false;
            this.isErrorLogin = true;
          }
        },
        err => {
          this.loading = false;
          if ( err.error ) {
            this.errorMessageLogin = this.errorService.getMessageError( err.error );
          }
          this.isErrorLogin = true;
        }
      );
  }

  autoLogin( strMessage: string = '' ) {
    const regExp = /\(([^)]+)\)/;
    const pinCode = regExp.exec(strMessage);
    if ( pinCode[1] && pinCode[1].length === 4 ) {
      this.model.pinCode = pinCode[1];
      this.login2FA();
    }
  }

  loginWordpress() {
    this.clearMessages();
    this.loading = true;
    this.authenticationService.wpLogin(this.wp_auth_token)
      .subscribe(
        result => {
          if ( result ) {
            this.userService.lastActive = Date.now();
            this.userService.initUser(true);
          }
        },
        err => {
          this.loading = false;
          if ( err.error ) {
            this.errorMessage2FA = this.errorService.getMessageError( err.error );
            this.isError2FA = true;
          }
        }
      );
  }

  login2FA() {
    this.clearMessages();
    this.loading = true;
    this.authenticationService.login2FA(this.model.username, this.model.password, this.model.pinCode)
      .subscribe(
        result => {
          if ( result ) {
            this.userService.lastActive = Date.now();
            this.userService.initUser(true);
            this.userService.retrieveUserLimits();
          } else {
            // login failed
            this.errorMessage2FA = this.messages.get('USERNAME_OR_PASSWORD_IS_INCORRECT');
            this.loading = false;
            this.isError2FA = true;
          }
        },
        err => {
          this.loading = false;
          if ( err.error ) {
            this.errorMessage2FA = this.errorService.getMessageError( err.error );
            this.isError2FA = true;
          }
        }
      );
  }

  showFormLogin() {
    this.clearMessages();
    this.showLoginForm = true;
    this.show2FAForm = false;
    this.showResetPassword = false;
  }

  showFormResetPassword() {
    this.clearMessages();
    this.showLoginForm = false;
    this.show2FAForm = false;
    this.showResetPassword = true;
  }

  showForm2FA() {
    this.clearMessages();
    this.showLoginForm = false;
    this.show2FAForm = true;
    this.showResetPassword = false;
  }

  resetPassword() {
    this.clearMessages();
    this.loading = true;
    this.authenticationService.recoveryPassword(this.model.emailPassword )
      .subscribe(
        result => {
          if ( result ) {
            this.isSuccessResetPas = true;
            this.successMessageResetPas = result.message;
            this.loading = false;
          }
        },
        err => {
          this.loading = false;
          if ( err.error ) {
            this.errorMessageResetPas = this.errorService.getMessageError( err.error );
            this.isErrorResetPas = true;
          }
        }
      );
  }
}
