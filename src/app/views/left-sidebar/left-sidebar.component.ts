import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../auth.service';
import {UserService} from '../../_services/user.service';
import {JqueryService} from '../../_services/jquery.service';
import {Location} from '@angular/common';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.css']
})
export class LeftSidebarComponent implements OnInit {
  public menu: any = [];
  public objLink: any = environment.link;
  constructor(
    public userService: UserService,
    private authenticationService: AuthenticationService,
    public jqueryService: JqueryService,
    public location: Location,
    public router: Router
  ) {}

  ngOnInit() {

  }

  getName() {
    return this.userService.getFullName();
  }

  getRoleName() {
    let strRole = '';
    switch (this.userService.getUserRole()) {
      case 'SuperAdmin':
      case 'Admin':
        strRole = 'Administrator';
        break;
      case '':
    }

    return strRole;
  }

  logout() {
    this.authenticationService.logout();
  }

  callAction(stringAction: string = '' ) {
    eval(stringAction );
  }

  checkAction( itemMenu: any ) {
    if ( itemMenu.clickAction ) {
      return this.callAction( itemMenu.clickAction );
    } else {
      return this.router.navigateByUrl(itemMenu.sref);
    }
  }

}
