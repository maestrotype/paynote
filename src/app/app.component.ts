import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, UrlSerializer } from '@angular/router';
import {MessagesService} from './_services/messages.service';
import {UserService} from './_services/user.service';
import {JqueryService} from './_services/jquery.service';
import {ToasterConfig} from 'angular2-toaster';
import { CookieService } from 'ngx-cookie-service';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: '<toaster-container [toasterconfig]="toasterConfig"></toaster-container><router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {

  previousUrl: string;
  public isApplyColorTheme = false;

  public toasterConfig: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-top-right',
    animation: 'fade',
    timeout: 15000,
    bodyOutputType: 1
  });

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private messages: MessagesService,
    public userService: UserService,
    private cookieService: CookieService,
    private urlSerialise: UrlSerializer,
    public jqueryService: JqueryService
    ) {
    this.router.events
      .subscribe((event) => {
//        this.initColorTheme()
        if (event instanceof NavigationStart) {
          const currentUrlSlug = this.getCurentSlug( event.url );
          this.parseGoogleCampaingSource( event.url );
          switch (currentUrlSlug ) {
            case 'login':
            case 'sign-up':
            case 'create-password':
            case 'reset-password':
              this.setClassesForLogin();
              break;
            default:
              this.setClassesForLoginedUser();
              break;
          }

          if (this.hasSlugOnUrl(currentUrlSlug, 'express-checkout' ) >= 0 ) {
            this.setClassesForExpresCheckout();
            return;
          }

          if ( this.hasSlugOnUrl( currentUrlSlug, 'recovery-password'  ) >= 0
              || this.hasSlugOnUrl( currentUrlSlug, 'create-password'  ) >= 0
              || this.hasSlugOnUrl( currentUrlSlug, 'sign-up'  ) >= 0 ) {
            this.setClassesForLogin();
          }

          if ( this.hasSlugOnUrl( currentUrlSlug, 'check/'  ) >= 0
              || this.hasSlugOnUrl( currentUrlSlug, 'invoice/'  ) >= 0
              || this.hasSlugOnUrl( currentUrlSlug, 'checkout/'  ) >= 0
              || this.hasSlugOnUrl( currentUrlSlug, 'confirm-email/'  ) >= 0 ) {
            this.setClassesForClient();
          }

          if (this.router.isActive('\login', true)
            || this.router.isActive('\sign-up', true) ) {
            this.setClassesForLogin();
          }
        }

        if (event instanceof NavigationEnd ) {
          const currentUrlSlug = this.getCurentSlug( event.url );
          switch (currentUrlSlug ) {
            case 'login':
            case 'sign-up':
            case 'recovery-password':
            case 'create-password':
            case 'reset-password':
              this.setClassesForLogin();
              break;
            default:
              this.setClassesForLoginedUser();
              break;
          }

          if (this.hasSlugOnUrl(currentUrlSlug, 'express-checkout' ) >= 0 ) {
            this.setClassesForExpresCheckout();
            return;
          }

          if ( this.hasSlugOnUrl( currentUrlSlug, 'recovery-password'  ) >= 0
              || this.hasSlugOnUrl( currentUrlSlug, 'create-password'  ) >= 0
              || this.hasSlugOnUrl( currentUrlSlug, 'sign-up'  ) >= 0 ) {
            this.setClassesForLogin();
          }

          if (this.router.isActive('\login', true)
            || this.router.isActive('\sign-up', true) ) {
            this.setClassesForLogin();
          }
        }
      });

  }

//  initColorTheme() {
//    if( localStorage.getItem('colorScheme') && !this.isApplyColorTheme ) {
//      this.isApplyColorTheme = true
////      this.jqueryService.applyColorTheme()
//    }
//  }

  getCurentSlug( url: string = '' ) {
    const currentUrl = url.slice(1);
    const arrUrlSlug = currentUrl.split('?');
    return arrUrlSlug[0];
  }

  hasSlugOnUrl(strSlug: string, strPattern: string ) {
    return strSlug.indexOf(strPattern );
  }

  ngOnInit() {
    this.messages.init();
//    this.initAuthUser()

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });

  }

  initAuthUser() {
//    if ( environment.isSandBoxMode && this.cookieService.check('tkn') && this.cookieService.get('tkn') ) {
//      localStorage.setItem('currentUser', this.cookieService.get('tkn') )
//      this.userService.initUser(true)
//    }
//    else if ( environment.isSandBoxMode && !localStorage.getItem('currentUser') ) {
//      this.userService.demoLogin()
//      this.userService.initUser(true)
//      return true
//    }
  }

  // sand-box-mode

  setClassesForClient() {
    this.renderer.addClass(document.body, 'client-wrapper');
  }

  setClassesForLogin() {
    this.renderer.addClass(document.body, 'auth-wrapper');
    this.renderer.removeClass(document.body, 'menu-position-side');
    this.renderer.removeClass(document.body, 'menu-side-left');
    this.renderer.removeClass(document.body, 'full-screen');
    this.renderer.removeClass(document.body, 'with-content-panel');
    this.renderer.removeClass(document.body, 'sand-box-mode');
    this.renderer.removeClass(document.body, 'demo-box-mode');
    this.renderer.removeClass(document.body, 'color-scheme-dark');
  }

  setClassesForLoginedUser() {
    this.renderer.removeClass(document.body, 'auth-wrapper');
    this.renderer.addClass(document.body, 'menu-position-side');
    this.renderer.addClass(document.body, 'menu-side-left');
    this.renderer.addClass(document.body, 'full-screen');
    this.renderer.addClass(document.body, 'with-content-panel');
    if (this.userService.isSandBoxMode() && !this.userService.isDemoUser() ) {
      this.renderer.addClass(document.body, 'sand-box-mode');
    }
    if (this.userService.isSandBoxMode() && this.userService.isDemoUser() ) {
      this.renderer.addClass(document.body, 'demo-box-mode');
    }
    if ( localStorage.getItem('colorScheme') ) {
      this.renderer.addClass(document.body, localStorage.getItem('colorScheme'));
    }
  }

  setClassesForExpresCheckout() {
    this.renderer.addClass(document.body, 'expres-checkout-wrapper');
    this.renderer.removeClass(document.body, 'menu-position-side');
    this.renderer.removeClass(document.body, 'menu-side-left');
    this.renderer.removeClass(document.body, 'full-screen');
    this.renderer.removeClass(document.body, 'with-content-panel');
    this.renderer.removeClass(document.body, 'sand-box-mode');
    this.renderer.removeClass(document.body, 'demo-box-mode');
    this.renderer.removeClass(document.body, 'color-scheme-dark');
    this.renderer.removeClass(document.body, 'client-wrapper');
    this.renderer.removeClass(document.body, 'auth-wrapper');
  }

  parseGoogleCampaingSource( url: string = '' ) {
    const objUrlTree = this.urlSerialise.parse( url);
    if ( objUrlTree.queryParamMap.keys.length ) {
      localStorage.setItem('google_campaign', JSON.stringify(objUrlTree.queryParams));
    }
  }
}
