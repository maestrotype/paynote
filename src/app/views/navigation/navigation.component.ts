import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from '../../auth.service';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {MatDialog} from '@angular/material';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import {JqueryService} from '../../_services/jquery.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  public host: string = environment.host;
  public objUser: any;
  public intCountMessages = 0;
  public listMessages: any = [];

  constructor(
    private http: HttpClient,
    public userService: UserService,
    private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    public jqueryService: JqueryService,
    private router: Router,
    private _location: Location
  ) {}

  ngOnInit() {
    this.initListMessages();
  }

  logout() {
    this.authenticationService.logout();
  }

  initListMessages() {
    if (this.userService.isAdmin() || this.userService.isSuperAdmin() ) {
      this.getCountEmptyEmailTemplates();
    }

    if (this.userService.isCustomer() ) {
      this.getCountNewInvoices();
    }
  }

  goBack() {
    this._location.back();
  }

  getCountNewInvoices() {
    this.http.get<any>(this.host + '/client/check/invoice/new/count', {params: {u_token: this.userService.getToken() }})
      .subscribe(
        response => {
          if ( response.success && response.count > 0 ) {
            this.listMessages.push({
              message1: response.count == 1 ? 'New Payment Request' : 'New Payment Requests',
              message2: 'You have new ' + response.count + ' Payment Request' + ( response.count == 1 ? '' : 's' ),
              link: '/request-payments'
            });
            this.intCountMessages += 1;
          }
        },
        err => { console.log(err); }
      );
  }

  getCountEmptyEmailTemplates() {
    this.http.get<any>(this.host + '/mail/template/empty')
      .subscribe(
        response => {
          if ( response.success && response.count > 0 ) {
            this.listMessages.push({
              message1: 'Dwolla Required',
              message2: 'Missing templates (' + response.count + ')',
              link: '/mail-template'
            });
            this.intCountMessages += 1;
          }
        },
        err => { console.log(err); }
      );
  }

  prepareRedirectToSandBox() {
    const objDataDialog = {
      title: 'Confirm mode switch',
      text: 'You are switching to <b>Sandbox</b> mode. This will allow you to test how the system works.\n\
         <br><br>The background will be yellow in <b>Sandbox</b> mode.',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm',
      confirm: 'redirectToSandBox'
    };
    this.openDialog(objDataDialog );
  }
  prepareRedirectToLive() {
    const objDataDialog = {
      title: 'Confirm mode switch',
      text: 'You are switching to <b>Live</b> mode. You can toggle back to test mode by clicking on the "Go To Sandbox" button in the top left corner.\n\
              <br><br> The background will be white in Live mode.',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm',
      confirm: 'redirectToSandBox'
    };
    this.openDialog(objDataDialog );
  }

  signUpToLive() {
    this.jqueryService.addClass('.onboarding-modal', 'show-on-load');
    this.jqueryService.showModal('.onboarding-modal.show-on-load', {backdrop: 'static', keyboard: false, showClose: true});
  }

  getCurrentUrl() {
    return  '/#' + this.router.url;
  }

  redirectToSandBox() {
    window.location.href = environment.sandboxHost + this.getCurrentUrl();
  }
  redirectToLive() {
    window.location.href = environment.liveHost + this.getCurrentUrl();
  }

  openDialog( objDataDialog: any ): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: objDataDialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result ) {
        if (objDataDialog.confirm === 'redirectToSandBox') {
          this.redirectToSandBox();
        }
      }
    });
  }

}
