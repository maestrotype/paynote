import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

import {UserService} from '../../_services/user.service';
import {ErrorService} from '../../_services/error.service';
import {JqueryService} from '../../_services/jquery.service';
import {Utility} from '../../_helpers/utility';

import {MessagesService} from '../../_services/messages.service';
import {AuthenticationService} from '../../auth.service';
import {validatePhone} from '../../_vaidators/phone';
import {TopAlertsService} from '../../_services/top-alerts.service';


@Component({
  selector: 'app-password-setup',
  templateUrl: './password-setup.component.html',
  styleUrls: ['./password-setup.component.css'],
  providers: [ErrorService]
})
export class PasswordSetupComponent implements OnInit {

  public host: string = environment.host;
  public loading = false;
  public setupPasswordForm: FormGroup;
  public canCloseModal = false;
  public barLabel = '';
  public myColors = ['#DD2C00', '#FF6D00', '#FFD600', '#AEEA00', '#00C853'];
  public maskPhone: any = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public objDigitCheck: any = {
    verifyCodeSend: false,
    bankAccountType: 'checking',
    acceptPolicy: false,
    accountType: '',
    account_id: 0
  };
  public objInvoice: any = {};

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
    public topAlertsService: TopAlertsService
  ) {}

  ngOnInit() {
    this.errorService.clearAlerts();
    this.userService.initUser();
    this.jqueryService.removeSelector('.modal-backdrop.fade');
    this.jqueryService.removeSelector('.modal.fade.show.d-block');

    this.setupPasswordForm = this._formBuilder.group({
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
      u_token: [
        this.userService.getToken()
      ],
      phone: ['', Validators.compose([
        Validators.required,
        Validators.minLength(14),
        Validators.maxLength(14),
        validatePhone
        //        Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")
      ])
      ],
      phone_pin: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)])
      ]
    });
  }

  setupPasswordPhoneRegister() {
    this.errorService.clearAlerts();
    this.loading = true;
    this.authenticationService.setupPasswordAndPhone(this.setupPasswordForm.value)
      .subscribe(
        result => {
          this.loading = false;
          this.canCloseModal = true;
          const objResp = <any> result;
          localStorage.setItem('currentUser', JSON.stringify(objResp));
          this.topAlertsService.popToast('success', 'Success', this.messages.get('YOUR_PASSWORD_HAS_BEEN_SUCCESSFULLY_SET'));
          this.userService.reInitClient();
          this.jqueryService.closeModal('.password-setup-modal');
        },
        err => {
          this.loading = false;
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }



  sendVerifyCode(phone: any = null ) {
    this.objDigitCheck.verifyCodeSend = true;
      this.authenticationService.sendVerifyPhoneCodeForNewUser(phone)
        .subscribe(
          result => {
            const objResp = <any>result;
            if (objResp.success) {
//              console.log(objResp);
              this.errorService.getMessageSuccess(objResp);
            }
          },
          err => {
            if ( err.error.error ) {
              this.errorService.getMessageError( err.error );
            }
          }
        );
  }

  isShowOnLoad() {
    return false; // !environment.isSandBoxMode && this.userService.isCustomer() && !this.userService.isPasswordSet();
  }

}
