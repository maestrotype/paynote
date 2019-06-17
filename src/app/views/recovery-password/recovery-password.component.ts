import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';

import {AuthenticationService} from '../../auth.service';
import {ErrorService} from '../../_services/error.service';
import {MessagesService} from '../../_services/messages.service';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.css']
})
export class RecoveryPasswordComponent implements OnInit {
  
  public loading = false;
  public model: any = {};
  public host: string;
  public tokenPassword: string;
  public isSuccessReset: boolean;
  public isErrorReset: boolean;
  public successMessageReset: string;
  public errorMessageReset: string;

  constructor(
    private http: HttpClient,
    private router: ActivatedRoute,
    private route: Router,
    private authenticationService: AuthenticationService,
    public messages: MessagesService,
    private errorService: ErrorService
  ) {
    this.host = environment.host;
    this.isSuccessReset = false;
    this.successMessageReset = '';
    this.isErrorReset = false;
    this.errorMessageReset = '';
  }

  ngOnInit() {
    this.tokenPassword = this.router.snapshot.paramMap.get('token_password');
    console.log( this.tokenPassword )
  }
  
  resetPassword() {
    this.clearMessages()
    if( this.model.password != this.model.cpassword ) {
      this.errorMessageReset = this.messages.get('PASSWORD_DOES_NOT_MATCH_THE_CONFIRM_PASSWORD');
      this.isErrorReset = true;
      return;
    }
    this.authenticationService.resetPassword(this.tokenPassword, this.model.password, this.model.cpassword)
      .subscribe(
        result => {
          if ( result ) {
            if ( result.message && result.success ) {
              //this.route.navigate(['/login']);
              this.isSuccessReset = true;
              this.successMessageReset = result.message;
              this.loading = false;
            }
          }
        },
        err => {
          this.loading = false;
          if( err.error.error ) {
            this.errorMessageReset = this.errorService.getMessageError( err.error );
          }
          this.isErrorReset = true;
        }
      );
  }
  
  clearMessages() {
    this.isSuccessReset = this.isErrorReset = false;
    this.errorMessageReset = this.successMessageReset = '';
  }
}
