import {Component, OnInit, ViewChild, Renderer2, ElementRef, TemplateRef} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router, NavigationStart} from '@angular/router';
import {UserService} from '../../_services/user.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from '@angular/material';
import {JqueryService} from '../../_services/jquery.service';
import {PaginationService} from '../../_services/pagination.service';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {DialogService} from '../../_services/dialog.service';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {Utility} from '../../_helpers/utility';
import {MessagesService} from '../../_services/messages.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  public host: string = environment.host;
  public subDomen: string = environment.subDomen;
  public listMerchants: any = [];
  public listSameFingerprints: any = [];
  public errorMessage: string;
  public isError = false;
  public objParam: any;
  public isModalError: boolean;
  public errorModalMessage: string;
  public isLoading = false;
  public isSuccess = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public successMessage: string;
  public pageSize: any;
  public pageNo: any;
  public objFilter: any = {
    role: 'All',
    type: 'All',
    dwl_status: 'All',
    bank: 'All',
    plan_status: 'All',
    labels: 'All',
    status: 'Active'
  };
  public listPlans: any = [];
  public modalSize = 'sm';
  public objUserUsersComp: any = {
    storageFilterName: 'usersList',
    isVisibleChart: <boolean> false,
    lstGraphicsObj: <any>[
      {
        barChartLegend: true,
        barChartType: 'line',
        tabTitle: 'Intelligent search frauds',
        labelTitle: 'Intelligent search frauds (%)',
        tabLink: 'intelligent_search_frauds',
        tabActive: true,
        url: '/ml/average',
        request: null
      }
    ]
  };

  @ViewChild('templateListSameFingerprint')
  private templateListSameFingerprint: TemplateRef<any>;

  @ViewChild('popupTemplate')
  private popupTemplate: TemplateRef<any>;

  constructor(
    private http: HttpClient,
    private router: ActivatedRoute,
    private route: Router,
    private modalService: NgbModal,
    public userService: UserService,
    public paginationService: PaginationService,
    public dialog: MatDialog,
    private jqueryService: JqueryService,
    public dialogService: DialogService,
    public topAlertsService: TopAlertsService,
    public messages: MessagesService,
    public utility: Utility,
    private currencyPipe: CurrencyPipe,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.paginationService.sortField = 'created_at';
    this.paginationService.searchQuery = '';
    this.paginationService.pageSize = 100;
    this.jqueryService.initInterface();
    this.initFilter();
    this.getListPlans();
  }

  initFilter() {
    const objFilter = this.paginationService.getFilterFromLocalStorage(this.objUserUsersComp.storageFilterName);
    if ( objFilter ) {
      this.objFilter = Object.assign( this.objFilter, objFilter.filter );
      this.paginationService = Object.assign( this.paginationService, objFilter.pagination );
    }
  }

  togglePopupLabels(e) {
    if ( e.target.parentNode.parentNode.className === 'td-container visible-popup') {
      this.renderer.removeClass(e.target.parentNode.parentNode, 'visible-popup');
    }
    else {
      this.renderer.addClass(e.target.parentNode.parentNode, 'visible-popup');
    }
  }

  resetFilter() {
    this.paginationService.resetFilterInLocalStorage(this.objUserUsersComp.storageFilterName);
    this.objFilter = <any> {
      role: 'All',
      type: 'All',
      dwl_status: 'All',
      bank: 'All',
      plan_status: 'All',
      labels: 'All',
      status: 'Active'
    };
    this.paginationService.searchQuery = '';
    this.paginationService.sortField = 'created_at';
    this.paginationService.sortDir = 'DESC';
    this.paginationService.pageNo = 1;
    this.getListMerchants();
  }

  openPopup(popupTemplate, customer) {
    if (customer.labels && customer.labels.length) {
      this.modalRef = this.modalService.open(popupTemplate, {container: '.td-container', size: 'sm' });
    }
  }

  openDialogModal(content: any) {
      this.modalRef = this.modalService.open(content, {size: 'lg'});
  }

  getDwollaStatus( objUser: any = null ) {
    const status = <string> objUser.dwl_status;
    let showStatus = <string> status;
    if (status === 'document') {
      const settings = objUser.settings;
      if (settings && settings.document_status && settings.document_status == 'pending') {
        showStatus = 'Document Pending';
      }
    }

    return showStatus;
  }

  selectIndication(customer) {
    return customer.ip_risk && customer.ip_risk < 20 ? 'icon-light' : customer.ip_risk && customer.ip_risk < 50 && customer.ip_risk > 20 ? 'icon-warning' : 'icon-danger';
  }

  getListSameFingerprint(u_token: string = '') {
    this.listSameFingerprints = [];
    this.http.get<any>(this.host + '/user/same/fingerprint/list', {params: {u_token: u_token } })
      .subscribe(
        response => {
          if (response.success) {
            this.listSameFingerprints = response.list;
            this.modalSize = 'lg';
            this.openDialogModal(this.templateListSameFingerprint);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getListSameIP(u_token: string = '') {
    this.listSameFingerprints = [];
    this.http.get<any>(this.host + '/user/same/ip/list', {params: {u_token: u_token } })
      .subscribe(
        response => {
          if (response.success) {
            this.listSameFingerprints = response.list;
            this.modalSize = 'lg';
            this.openDialogModal(this.templateListSameFingerprint);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getListSameBankAccount(u_token: string = '') {
    this.listSameFingerprints = [];
    this.http.get<any>(this.host + '/user/same/account/list', {params: {u_token: u_token } })
      .subscribe(
        response => {
          if (response.success) {
            this.listSameFingerprints = response.list;
            this.openDialogModal(this.templateListSameFingerprint);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getListPlans() {
    this.http.get<any>(this.host + '/plan/list/public')
      .subscribe(
        response => {
          if (response.success) {
            this.listPlans = response.list;
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getDwlRequire( dwlRequire: any = null ) {
    if (dwlRequire) {
      let strDwlRequire = '&nbsp;';
      dwlRequire.forEach(function (require: any) {
        switch (require) {
          case 'verify-beneficial-owners':
            strDwlRequire += 'VERIFY&nbsp;OWNERS<br>';
            break;
          case 'certify-beneficial-ownership':
            strDwlRequire += 'CERTIFY&nbsp;OWNERS<br>';
            break;
        }
      });

      dwlRequire = null;

      return strDwlRequire;
    }
  }

  getListMerchants(event: any = null, bResetPages: boolean = false) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;

    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir
    };

    objRequest.page = bResetPages ? 1 : objRequest.page;
    objRequest = Object.assign(objRequest, this.objFilter);

    this.http.get<any>(this.host + '/user/all/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listMerchants = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
            this.paginationService.generateFilterForLocalStorage(this.objUserUsersComp.storageFilterName, this.objFilter );
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.isLoading = false;
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  getStatusPlanString(status: any = null) {
    let statusName;
    if (status) {
      switch (status) {
        case 'pending':
          statusName = 'Receive Only';
          break;
        case 'cancelled':
        case 'failed':
          statusName = 'Unpaid';
          break;
        default:
         statusName = status;
          break;

      }
    }
    return statusName;
  }

  onToggleMerchantStatus(value: any, adminsObj: any) {
    let lockActiveMerchantStatus;

    if (value.checked === true) {
      lockActiveMerchantStatus = 'Activate';
    } else {
      lockActiveMerchantStatus = 'Locked';
    }

    const objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to ' + lockActiveMerchantStatus + ' merchant status?',
      button_cancel_text: 'No',
      button_confirm_text: 'Yes',
      confirm: 'confirmMerchantStatus'
    };
    this.openDialog(objDataDialog, value.checked, adminsObj);
  }

  toogleFraud(objCustomer: any) {
    const seccessText = 'User ' + objCustomer.name + ' set as ' + (objCustomer.fraud ? ' not fraud' : ' fraud');
    const objDataDialog = {
      title: seccessText,
      text: 'Are you sure?',
      button_cancel_text: 'Cancel',
      button_confirm_text: 'Confirm'
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(this.host + '/user/fraud/update', {
          fraud: !objCustomer.fraud,
          u_token: objCustomer.u_token
        })
          .subscribe(
            response => {
              if (response.success) {
                this.topAlertsService.popToast('success', 'Success', seccessText + ' successfully');
                this.isLoading = false;
                if ( !objCustomer.fraud ) {
                  objCustomer.status = 'Locked';
                }
                objCustomer.fraud = !objCustomer.fraud;
              }
            },
            errResponse => {
              if (errResponse.error) {
                this.utility.getMessageError(errResponse.error);
                this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
              }
            }
          );
      }
    });
  }

  openDialog(objDataDialog: any, lockActiveStatusBoolean: boolean, adminsObj: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: objDataDialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (objDataDialog.confirm === 'confirmMerchantStatus') {
          this.confirmMerchantStatusToggle(lockActiveStatusBoolean, adminsObj);
        }
      }
    });
  }

  confirmMerchantStatusToggle(enebledDisabledStatus: boolean, adminsObj: any) {
    const status = enebledDisabledStatus === true ? 'Active' : 'Locked';
    this.http.post<any>(this.host + '/user/status/update', {
      status: status,
      u_token: adminsObj.u_token,
    })
      .subscribe(
        response => {
          if (response.success) {
            this.topAlertsService.popToast('success', 'Success', 'Merchant status successfully ' + status);
            this.getListMerchants(null);
          }
        },
        errResponse => {
          if (errResponse.error.error) {
            this.utility.getMessageError(errResponse.error);
            this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
          }
        }
      );
  }

  closeModal() {
    if ( !this.modalRef ) {
      return;
    }
    this.modalRef.close();
  }

  canShowChart() {
    return true;
  }

  canShowFraudButton() {
    return true;
  }

  toogleChart() {
    this.objUserUsersComp.isVisibleChart = !this.objUserUsersComp.isVisibleChart;
  }

  getLabelFraudRisk(objUser: any = null) {
    if (!objUser.machine_learning) {
      return '';
    }
    const risk = objUser.machine_learning.risk;
    let classLabel = '';

    let risklLabel = '';
    if (risk <= 40) {
      risklLabel = 'Low Risk';
      classLabel = 'badge badge-success-inverted';
    }
    if (risk > 40 && risk <= 70) {
      risklLabel = 'Medium Risk';
      classLabel = 'badge badge-warning-inverted';
    }
    if (risk > 70) {
      risklLabel = 'High Risk';
      classLabel = 'badge badge-danger-inverted';
    }

    return '<span class="' + classLabel + '"> ' + risklLabel + ' ' + risk + '%</span>';
  }

  getColorForFraudRisk(objUser: any = null) {
    if (!objUser.machine_learning) {
      return 'black';
    }
    const risk = objUser.machine_learning.risk;

    if (risk <= 40) {
      return '#43b536';
    }
    if (risk > 40 && risk <= 70) {
      return '#f4ba36';
    }
    if (risk > 70) {
      return '#f44336';
    }
  }

  getBankInfo(objUser: any = null) {
    if (objUser.available) {
      if (!objUser.available.balance) {
        return 'Balance not available';
      }
      return 'Balance ' + this.currencyPipe.transform(objUser.available.balance, '', 'symbol');
    }

    return objUser.bank;
  }
}
