import {Component, OnInit} from '@angular/core';

import {AuthenticationService} from '../../auth.service';
import {ErrorService} from '../../_services/error.service';
import {UserService} from '../../_services/user.service';
import {JqueryService} from '../../_services/jquery.service';
import {environment} from '../../../environments/environment';
import {MessagesService} from '../../_services/messages.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})

export class ResetPasswordComponent implements OnInit {
  model: any = {};
  loading = false;

  constructor(
    private authenticationService: AuthenticationService,
    public errorService: ErrorService,
    public userService: UserService,
    public messages: MessagesService,
    public jqueryService: JqueryService
  ) {}

  ngOnInit() {
    this.jqueryService.removeSelector('.modal-backdrop.fade');
    this.jqueryService.removeSelector('.modal.fade.show.d-block');
  }
  
  resetPassword() {
    this.errorService.clearAlerts()
    
    this.loading = true;
    this.authenticationService.recoveryPassword(this.model.emailPassword )
      .subscribe(
        result => {
          if ( result ) {
            this.errorService.getMessageSuccess( result )
            this.loading = false;
          }
        },
        err => {
          this.loading = false;
          if( err.error ) {
            this.errorService.getMessageError( err.error )
          }
        }
      );
  }
}

