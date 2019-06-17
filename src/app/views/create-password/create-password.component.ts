import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../auth.service';
import {ErrorService} from '../../_services/error.service';
import {UserService} from '../../_services/user.service';
import {JqueryService} from '../../_services/jquery.service';
import {environment} from '../../../environments/environment';
import {MessagesService} from '../../_services/messages.service';
import {Utility} from '../../_helpers/utility';

@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.css']
})
export class CreatePasswordComponent implements OnInit {
  
  public model: any = {};
  public loading = false;
  public isFirstStep: boolean = false;
  public isSecondStep: boolean = false;
  public setupPasswordForm: any = {};

  constructor(
    private authenticationService: AuthenticationService,
    public errorService: ErrorService,
    public userService: UserService,
    public messages: MessagesService,
    public jqueryService: JqueryService,
    private router: ActivatedRoute,
    public utility: Utility
  ) {}

  ngOnInit() {
    // reset login status
    if( this.router.snapshot.paramMap.get('create_password_token') ) {
      this.setupPasswordForm.token = this.router.snapshot.paramMap.get('create_password_token')
      this.isSecondStep = true
    } else {
      this.isFirstStep = true
    }
    this.errorService.clearAlerts()
    this.jqueryService.removeSelector('.modal-backdrop.fade')
    this.jqueryService.removeSelector('.modal.fade.show.d-block')
  }
  
  createPassword() {
    this.errorService.clearAlerts();
    this.loading = true;
    this.authenticationService.initiateCreatePassword(this.model.emailPassword )
      .subscribe(
        result => {
          if ( result ) {
            this.errorService.getMessageSuccess(result)
            this.loading = false
          }
        },
        err => {
          this.loading = false
          if( err.error ) {
            this.errorService.getMessageError( err.error )
          }
        }
      );
  }
  
  sendVerifyCode() {
    this.setupPasswordForm.verifyCodeSend = true;
      this.authenticationService.sendVerifyPhoneCodeForNewUser( this.setupPasswordForm.phone )
        .subscribe(
          result => {
            let objResp = <any>result;
            if (objResp.success) {
              this.jqueryService.setFocus('#phone_pin');
              this.errorService.getMessageSuccess(objResp);
            }
          },
          err => {
            if( err.error ) {
              this.errorService.getMessageError( err.error );
            }
          }
        );
  }
  
  setupPasswordPhoneRegister() {
    this.errorService.clearAlerts();
    this.loading = true;
    this.authenticationService.createPasswordAndPhone(this.setupPasswordForm)
      .subscribe(
        result => {
          this.loading = false;
          let objResp = <any> result;
          localStorage.setItem('currentUser', JSON.stringify(objResp));
          this.errorService.getMessageSuccess({message: this.messages.get('YOUR_PASSWORD_HAS_BEEN_SUCCESSFULLY_SET')})
          this.userService.initUser(true);
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
