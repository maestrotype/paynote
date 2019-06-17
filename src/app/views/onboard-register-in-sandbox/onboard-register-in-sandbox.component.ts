import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Router} from '@angular/router';

import { UserService } from '../../_services/user.service';
import { StatesService } from '../../_services/states.service';
import { ErrorService } from '../../_services/error.service';
import {JqueryService} from '../../_services/jquery.service';
import {Utility} from '../../_helpers/utility';

import {MessagesService} from '../../_services/messages.service';
import {AuthenticationService} from '../../auth.service';
import {validateFullName} from '../../_vaidators/fullName';
import {validateEmail} from '../../_vaidators/email';
import {validatePhone} from '../../_vaidators/phone';

@Component({
  selector: 'app-onboard-register-in-sandbox',
  templateUrl: './onboard-register-in-sandbox.component.html',
  styleUrls: ['./onboard-register-in-sandbox.component.css']
})
export class OnboardRegisterInSandboxComponent implements OnInit {

  public host: string = environment.host;
  showPhoneVerifyForm: boolean = false;
  
  model: any = {};
  public loading = false;
  
  public showSignUpForm: boolean = false;
  public modelSignUpSandbox: any;

  public isShowVerifyPhone = false;
  
  public signUpForm: FormGroup;
  public verifyPhoneForm: FormGroup;
   
  constructor(
    private http: HttpClient, 
    private userService: UserService,
    public jqueryService: JqueryService,
    private router: Router,
    public errorService: ErrorService,
    private _formBuilder: FormBuilder,
    public utility: Utility,
     public messages: MessagesService,
     private authenticationService: AuthenticationService,
  ) {
    this.modelSignUpSandbox = {      
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      passwordConfirm: '',
    };
  }

  ngOnInit() {
    this.userService.initUser();
    this.jqueryService.removeSelector('.modal-backdrop.fade');
    this.jqueryService.removeSelector('.modal.fade.show.d-block');
    
    this.signUpForm = this._formBuilder.group({
      phone: ['', Validators.compose([
        Validators.required, 
        Validators.minLength(14), 
        Validators.maxLength(14),
        validatePhone
        ])
      ],
      password: ['', Validators.compose([
        Validators.required, 
        Validators.minLength(8)
        ])
      ],
      cpassword: ['', Validators.compose([
        Validators.required, 
        Validators.minLength(8)
        ])
      ],
      name: ['', Validators.compose([
        Validators.required, 
        validateFullName])],
      email: ['', Validators.compose([
        Validators.required, 
        validateEmail
        ])
      ],
    });
    
    this.verifyPhoneForm = this._formBuilder.group({
      phone_pin: ['', Validators.compose([
        Validators.required, 
        Validators.minLength(4), 
        Validators.maxLength(4)])]
    });   
  } 
  
   showVerifyPhone() {
    this.sendVerifyPhoneCode();
    this.isShowVerifyPhone = true;
  }
  
  sendVerifyPhoneCode() {
    this.http.post<any>(this.host + '/user/phone/register', 
      {phone: this.signUpForm.value.phone, email: this.signUpForm.value.email }).subscribe( 
        response => {
          if (response.success ) {
            this.errorService.getMessageSuccess(response)
          }
        },
        errResponse => {
          if( errResponse.error.error ) {
            this.errorService.getMessageError( errResponse.error );
            this.showSignUpForm = false;
            this.showPhoneVerifyForm = false;
          }
        }
      );
  }
  
  signUpVerifyPhone() {
    this.errorService.clearAlerts();
    this.sendVerifyPhoneCode();
    
    this.showSignUpForm = true;
    this.showPhoneVerifyForm = true;
    
  }
  
  backToSignUpForm() {
    this.errorService.clearAlerts();
    this.showSignUpForm = false;
    this.showPhoneVerifyForm = false;
  }
  
  signUp() {
    this.errorService.clearAlerts();

    this.loading = true;
    let signUpForm = Object.assign(this.signUpForm.value, this.verifyPhoneForm.value );
    this.authenticationService.signUp(signUpForm)
      .subscribe(
        result => {
          this.authenticationService.clearLogin();
          this.loading = false;
          let objResp = <any>result;
          localStorage.setItem('currentUser', JSON.stringify(objResp));
          this.router.navigate(['/transactions']);
          window.location.reload();
        },
        err => {
          this.loading = false;
          if( err.error.error ) {
            this.errorService.getMessageError( err.error );
          }
        }
      );
  }

  isShowOnLoad() {
    return environment.isSandBoxMode && this.userService.isDemoUser()
  }
}
