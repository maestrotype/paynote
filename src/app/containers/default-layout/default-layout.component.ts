import { Component, Input, Renderer2, ViewChild, OnInit, ElementRef, TemplateRef } from '@angular/core'
import {JqueryService} from '../../_services/jquery.service'
import {UserService} from '../../_services/user.service'
import { Spinkit } from 'ng-http-loader'
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap'
import {ErrorService} from '../../_services/error.service'
import * as html2canvas from 'html2canvas'
import {AuthenticationService} from '../../auth.service'
import {TopAlertsService} from '../../_services/top-alerts.service'
import {MessagesService} from '../../_services/messages.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {
  public sidebarMinimized = true
  private changes: MutationObserver
  public element: HTMLElement = document.body
  public spinkit = Spinkit
  public objBugReportForm : any = {
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenPixelDepth: screen.pixelDepth,
    browseType: navigator.appName,
    browserVersion: navigator.appVersion,
    browserLanguage: navigator.language,
    platformOS: navigator.platform,
    u_token: this.userService.getToken(),
    action_name: 'Bug Report'
  }
  public modalRef: NgbModalRef
  
  @ViewChild('sendBugReport')
  private sendBugReport: TemplateRef<any>;
  
  constructor( 
    private renderer: Renderer2,
    private jquery: JqueryService,
    public userService: UserService,
    private modalService: NgbModal,
    public errorService: ErrorService,
    public topAlertsService: TopAlertsService,
    public messages: MessagesService,
    private authService: AuthenticationService
  ) {

    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = document.body.classList.contains('sidebar-minimized')
    });

    this.changes.observe(<Element>this.element, {
      attributes: true
    });
  }
  
  ngOnInit() {
    this.jquery.initInterface();
  }
  
  toogleDarkColors() {
    if( !document.body.classList.contains('color-scheme-dark') ) {
      this.renderer.addClass(document.body, 'color-scheme-dark');
    } else {
      this.renderer.removeClass(document.body, 'color-scheme-dark');
    }
  }
  
  openModal(content: any) {
    this.errorService.clearAlerts();
    if( this.modalRef ) {
      this.modalRef.close();
    }
    this.modalRef = this.modalService.open(content);
  }
  
  closeModal() {
    this.modalRef.close();
  }
  
  sendBugReportAction() {
    this.closeModal()
    html2canvas(document.getElementsByTagName('html').item(0)).then(canvas => {
      this.objBugReportForm.imageBase64Url = canvas.toDataURL('image/png').replace("image/png", "image/png")
      
      this.authService.sendBugReport(this.objBugReportForm)
        .subscribe(
          result => {
            let objResp = <any> result;
            this.topAlertsService.popToast('success', 'Success', 'Your problem will be reviewed soon')
            return false;
          },
          err => {
            if (err.error) {
              this.topAlertsService.popToast('error', 'Error', err.error.message)
            }
          }
        );
    });
  } 
}

// https://github.com/mpalourdio/ng-http-loader#requests-filtering-by-url-http-method-or-http-headers

//export const Spinkit = {
//    skChasingDots: 'sk-chasing-dots',
//    skCubeGrid: 'sk-cube-grid',
//    skDoubleBounce: 'sk-double-bounce',
//    skRotatingPlane: 'sk-rotationg-plane',
//    skSpinnerPulse: 'sk-spinner-pulse',
//    skThreeBounce: 'sk-three-bounce',
//    skWanderingCubes: 'sk-wandering-cubes',
//    skWave: 'sk-wave',
//};
