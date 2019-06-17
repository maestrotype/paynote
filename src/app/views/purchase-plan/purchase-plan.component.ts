import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ErrorService} from '../../_services/error.service';
import {MessagesService} from '../../_services/messages.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {JqueryService} from '../../_services/jquery.service';

@Component({
  selector: 'app-purchase-plan',
  templateUrl: './purchase-plan.component.html',
  styleUrls: ['./purchase-plan.component.css'],
  providers: [ErrorService]
})
export class PurchasePlanComponent implements OnInit {

  public host: string = environment.host;
  public isLoading = false;
  public modalRef: NgbModalRef;
  public listViewOurPlan: any;
  public subPTocken: any;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    public userService: UserService,
    public messages: MessagesService,
    public topAlertsService: TopAlertsService,
    public jqueryService: JqueryService
  ) { }

  ngOnInit() {
    this.getListViewOurPlans();
  }

  openModal(content: any, size: any = 'sm') {
    this.closeModal();
    this.modalRef = this.modalService.open(content, {size: size});
  }

  closeModal() {
    if ( !this.modalRef ) {
      return;
    }
    this.modalRef.close();
  }

  isBlockSelectedPlan( p_token: string = '' ) {
    const plan = this.userService.getSubscription();
    if (!plan ) {
      return false;
    }

    if (p_token != plan.p_token ) {
      return false;
    }
    if ( plan && (plan.status == 'failed' || plan.status == 'canceled' ) ) {
      return true;
    }

    return false;
  }

  isDisableSelectPlan( p_token: string = '' ) {
    const plan = this.userService.getSubscription();
    if (!plan ) {
      return false;
    }

    if ((p_token === plan.p_token && plan.status === 'processed') || plan.status === 'pending' || this.isLoading ) {
      return true;
    }

    return false;
  }

  getButtonTitleBuyPlan( viewPlan: any = null ) {
    const plan = this.userService.getSubscription();

    if (!plan ) {
      return 'Select Plan';
    }

    if ( plan.p_token != viewPlan.p_token && viewPlan.amount != '0.00' ) {
      return 'Select Plan';
    }
    if ( plan.p_token == viewPlan.p_token ) {
      return 'Selected plan';
    }
    if ( plan.p_token != viewPlan.p_token && viewPlan.amount == '0.00' ) {
      return 'Create Free Account';
    }
  }

  getListViewOurPlans() {
    setTimeout(() => this.errorService.clearAlerts(), 3000);

    this.http.get<any>(this.host + '/plan/list/public')
      .subscribe(
        response => {
          if (response.success) {
            this.listViewOurPlan = !this.userService.isIndividualAccount()
              ? response.list.slice(1, response.list.length)
              : response.list;

            this.initUserPlan();
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  initUserPlan() {
    if (this.userService.isHavePlan() ) {
      const subscription = this.userService.getSubscription();
      this.subPTocken = subscription.p_token;
      this.isLoading = false;
    }
  }

  addMerchandPlan(p_token: any) {
    this.isLoading = true;
    this.jqueryService.closeModal('.onboarding-purchase-plan-modal');

    let url = '/subscription/customer/plan/add';
    if (this.userService.isClient()) {
      url = '/subscription/client/plan/add';
    }
    this.http.post<any>(this.host + url, {
      u_token: this.userService.getToken(),
      p_token: p_token,
    })
      .subscribe(
        response => {
          if (response.success) {
            this.userService.reInitClient();
            this.topAlertsService.popToast('success', 'Success', this.messages.get('PLAN_ADDED_SUCCESSFULLY'));
            this.jqueryService.closeModal('.onboarding-purchase-plan-modal');
            if ( localStorage.getItem('redirect_url_after') ) {
              this.userService.redirectJustSimple( localStorage.getItem('redirect_url_after'), false );
              localStorage.removeItem('redirect_url_after');
            }
            if (window.location.pathname === '/transactions') {
              window.location.reload();
            }
            scrollTo(0, 20);
          }
        },
        errResponse => {
          this.isLoading = false;
          if (errResponse.error) {
            this.jqueryService.showPurchasePlanModal();
            this.topAlertsService.popToast('error', 'Error', errResponse.error.message);
          }
        }
      );
  }
}
