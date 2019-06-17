import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {NgForm, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {JqueryService} from '../../_services/jquery.service';
import {Utility} from '../../_helpers/utility';

import {AuthenticationService} from '../../auth.service';
import {ErrorService} from '../../_services/error.service';
import {validateFullName} from '../../_vaidators/fullName';
import {validateEmail} from '../../_vaidators/email';
import {validatePhone} from '../../_vaidators/phone';
import {Spinkit} from 'ng-http-loader';
import {MessagesService} from '../../_services/messages.service';
import {UserService} from '../../_services/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  providers: [ErrorService]
})
export class SignUpComponent implements OnInit {

  public spinkit = Spinkit;
  public host: string;
  public model: any = {};
  public invitation: any = {};
  public loading = false;

  public isSuccessSendCode = false;
  public successSendCodeMessage = '';
  public errorSendCodeMessage = '';
  public isErrorSendCode = false;
  public showSignUpForm = true;
  public showPhoneVerifyForm = false;
  public myColors = ['#DD2C00', '#FF6D00', '#FFD600', '#AEEA00', '#00C853'];
  public barLabel = '';
  public strInviteCode = '';
  public strPhoneType = '';
  public bIsInvite = false;
  public isShowVerifyPhone = false;

  public signUpForm: FormGroup;
  public verifyPhoneForm: FormGroup;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private fb: FormBuilder,
    public errorService: ErrorService,
    private _formBuilder: FormBuilder,
    public utility: Utility,
    private jqueryService: JqueryService,
    private activatedRoute: ActivatedRoute,
    public messages: MessagesService,
    private userService: UserService,
  ) {
    this.host = environment.host;
  }

  ngOnInit() {
    if (this.activatedRoute.snapshot.paramMap.get('invite_code')) {
      this.strInviteCode = this.activatedRoute.snapshot.paramMap.get('invite_code');
      this.bIsInvite = true;
    }
    this.authenticationService.clearLogin();
    this.jqueryService.removeSelector('.modal-backdrop.fade');
    this.jqueryService.removeSelector('.modal.fade.show.d-block');

    this.signUpForm = this._formBuilder.group({
      phone: ['', Validators.compose([
        Validators.required,
        Validators.minLength(14),
        Validators.maxLength(14),
        validatePhone
      ])],
      password: ['', Validators.compose([
        Validators.required
        //        Validators.minLength(8)
      ])],
      cpassword: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8)
      ])],
      //      phone_pin: ['', Validators.compose([
      //        Validators.required,
      //        Validators.minLength(4),
      //        Validators.maxLength(4)])],
      name: ['', Validators.compose([
        Validators.required,
        validateFullName])],
      email: ['', Validators.compose([
        Validators.required,
        validateEmail])
      ],
      acceptPolicy: [false, Validators.compose([Validators.required])],
    });

    this.verifyPhoneForm = this._formBuilder.group({
      phone_pin: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)])]
    });

    if (this.bIsInvite) {
      this.signUpForm.get('email').disable();
      this.getInviteEmail();
    }
  }

  getInviteEmail() {
    this.http.post<any>(this.host + '/user/invitation/retrieve', {inv_token: this.strInviteCode})
      .subscribe(
        response => {
          if (response.success && response.invitation ) {
            this.invitation = response.invitation;
            this.signUpForm.patchValue({email: response.invitation.email});
          } else {
            this.bIsInvite = false;
            this.signUpForm.get('email').enable();
          }
        },
        err => {
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }

  showVerifyPhone() {
    this.sendVerifyPhoneCode();
    this.isShowVerifyPhone = true;
  }

  sendVerifyPhoneCode(): any {
    this.http.post<any>(this.host + '/user/phone/register',
      {
        phone: this.signUpForm.value.phone,
        email: this.signUpForm.value.email,
        phone_type: this.strPhoneType
      }).subscribe(
        response => {
          if (response.success) {
            this.errorService.getMessageSuccess(response);
          }
        },
        errResponse => {
          if (errResponse.error) {
            if (errResponse.error.label == 'PHONE_IS_NOT_VALID' || errResponse.error.label == 'PHONE_ALREDY_IN_USE') {
              this.signUpForm.get('phone').setValue('');
            }
            this.showSignUpForm = true;
            this.showPhoneVerifyForm = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  signUpVerifyPhone() {
    this.errorService.clearAlerts();
    setTimeout(this.sendVerifyPhoneCode(), 1500);
    this.showSignUpForm = false;
    this.showPhoneVerifyForm = true;
  }

  signUpValidate() {
    this.loading = true;
    let objRequest;
    if (this.bIsInvite) {
      objRequest = Object.assign(this.signUpForm.value, {email: this.invitation.email, inv_token: this.invitation.inv_token});
    } else {
      objRequest = Object.assign(this.signUpForm.value);
    }
    this.http.post<any>(this.host + '/user/merchant/register/validate', objRequest)
      .subscribe(
        response => {
          this.loading = false;
          if (response.success) {
            this.strPhoneType = response.phone_type;
            this.signUpVerifyPhone();
          }
        },
        errResponse => {
          this.loading = false;
          if (errResponse.error) {
            if (errResponse.error.label == 'PHONE_IS_NOT_VALID' || errResponse.error.label == 'PHONE_ALREDY_IN_USE') {
              this.signUpForm.get('phone').setValue('');
            }
            if (errResponse.error.label == 'EMAIL_IS_UNDELIVERABLE' || errResponse.error.label == 'EMAIL_ALREDY_IN_USE') {
              this.signUpForm.get('email').setValue('');
            }
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );

  }

  isVoiceCode() {
    return this.strPhoneType === 'voip' || this.strPhoneType === 'landline';
  }

  backToSignUpForm() {
    this.errorService.clearAlerts();
    this.showSignUpForm = true;
    this.showPhoneVerifyForm = false;
  }

  signUp() {
    this.errorService.clearAlerts();
    this.loading = true;
    let signUpForm;
    if (this.bIsInvite) {
      signUpForm = Object.assign(this.signUpForm.value, this.verifyPhoneForm.value,
        {email: this.invitation.email, inv_token: this.invitation.inv_token});
    } else {
      signUpForm = Object.assign(this.signUpForm.value, this.verifyPhoneForm.value);
    }
    if (localStorage.getItem('google_campaign')) {
      signUpForm.google_campaign = JSON.parse(localStorage.getItem('google_campaign'));
    }

    this.authenticationService.signUp(signUpForm)
      .subscribe(
        result => {
          this.loading = false;
          const objResp = <any> result;
          if (objResp.success && objResp.token) {
            localStorage.removeItem('google_campaign');
            localStorage.setItem('currentUser', JSON.stringify(objResp));
            this.userService.initUser(true);
            //            this.router.navigate(['/dashboard'])
          }
          return false;
        },
        err => {
          this.loading = false;
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }

}
