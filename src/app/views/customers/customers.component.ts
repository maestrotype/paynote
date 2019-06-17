import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ErrorService} from '../../_services/error.service';
import {PaginationService} from '../../_services/pagination.service';
import {MessagesService} from '../../_services/messages.service';
import {DialogService} from '../../_services/dialog.service';
import {CurrencyPipe} from '@angular/common';
import {Utility} from '../../_helpers/utility';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  public host: string;
  listCustomers: any = [];
  public errorMessage: string;
  public isError: boolean;
  public lstFundSources: any;
  public objParam: any;
  public modelNewCustomer: any;
  public isModalError: boolean;
  public errorModalMessage: string;
  public isLoading = false;
  public isSuccess = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public pageSize: any;
  public pageNo: any;
  public isNotHaveFunds = false;

  public successMessage: string;
  public objSend: any = {};
  public objReceive: any = {};
  public storageFilterName = 'merchantCustomers';


  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    public userService: UserService,
    public messages: MessagesService,
    public paginationService: PaginationService,
    public dialogService: DialogService,
    private currencyPipe: CurrencyPipe,
    public utility: Utility,
  ) {
    this.host = environment.host;
    this.isError = false;
    this.modelNewCustomer = {
      email: '',
      firstName: '',
      lastName: '',
      u_token: '',
      accountNumber: '',
      bankAccountType: '',
      cAccountNumber: '',
      routingNumber: '',
      phone: '',
      name: ''
    };
  }

  ngOnInit() {
    this.paginationService.searchQuery = '';
    this.errorService.clearAlerts();
    this.objReceive.sndr_name = this.userService.getFullName();
    this.objReceive.email = this.userService.getEmail();
    this.getMerchantFundSources();
    this.initSendAndRequestForms();
    this.initFilter();
  }

  initFilter(): void {
    const objFilter = this.paginationService.getFilterFromLocalStorage(this.storageFilterName);
    if ( objFilter ) {
      // this.objFilter = Object.assign( this.objFilter, objFilter.filter );
      this.paginationService = Object.assign( this.paginationService, objFilter.pagination );
    }
  }

  resetFilter(): void {
    this.paginationService.resetFilterInLocalStorage(this.storageFilterName);
    this.paginationService.searchQuery = '';
    this.paginationService.sortField = 'created_at';
    this.paginationService.sortDir = 'DESC';
    this.paginationService.pageNo = 1;
    this.getListCustomers();
  }

  initSendAndRequestForms() {
    this.objSend = {
      name: '',
      email: '',
      amount: '',
      fs_token: '',
      description: '',
      sndr_name: ''
    };
    this.objReceive = {
      email: '',
      amount: '',
      description: '',
      sndr_name: ''
    };
  }

  openAddCustomersByOwnerModal(content: any) {
    this.modalRef = this.modalService.open(content);
  }

  validateSendMoneyForm() {
    if (this.objSend.email == this.userService.getEmail()) {
      this.errorService.getMessageError({message: this.messages.get('YOU_CAN_NOT_SEND_MONEY_TO_THE_SAME_ACCOUNT')});
      return false;
    }

    return true;
  }

  checkSourceAccount() {
    this.isLoading = true;
    const fs_token = this.objSend.fs_token;
    if ((fs_token == '' || fs_token == null) || !this.objSend.amount) {
      return;
    }
    const objRequest = {
      fs_token: fs_token
    };
    this.http.get<any>(this.host + '/dwl/customer/funding-source/balance', {params: objRequest})
      .subscribe(
        response => {
          if (response.success && response.balance) {
            const availableAmount = parseFloat(response.balance);
            const requestAmount = parseFloat(this.objSend.amount);
            this.isNotHaveFunds = requestAmount > availableAmount;
          } else {
            this.isNotHaveFunds = false;
          }
          this.isLoading = false;
        },
        err => {
          this.isLoading = false;
          if (err.error) {
            this.isNotHaveFunds = false;
          }
        }
      );
  }

  prepareCreatePayLink() {
    this.errorService.clearAlerts();
    if (!this.validateSendMoneyForm()) {
      return;
    }
    this.isLoading = true;
    const objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to send a check of <b>'
        + this.currencyPipe.transform(this.objSend.amount, '', 'symbol')
        + '</b> to <b>' + this.objSend.name + '</b>?',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_send_money'),
      checkbox_confirm: true,
      checkbox_confirm_text: 'Please confirm',
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        const objRequest: any = this.objSend;
        objRequest.u_token = this.userService.getToken();
        objRequest.metadata = {
          description: this.objSend.description
        };
        this.http.post<any>(this.host + '/dwl/customer/payment-link/create', objRequest)
          .subscribe(
            response => {
              if (response.success) {
                this.errorService.getMessageSuccess(response, this.messages.get('MONEY_SUCCESSFULLY_SENT'));
                this.closeModal();
                this.isLoading = false;
                scrollTo(0, 20);
                this.initSendAndRequestForms();
              }
            },
            err => {
              if (err.error.error) {
                this.errorService.getMessageError(err.error);
              }
            }
          );
      }
    });
  }

  prepareCreateRequestCheck() {
    this.errorService.clearAlerts();
    if (!this.validateSendMoneyForm()) {
      return;
    }
    this.isLoading = true;
    const objDataDialog = {
      title: 'Please confirm',
      text: 'Are you sure you want to request a check of <b>'
        + this.currencyPipe.transform(this.objReceive.amount, '', 'symbol')
        + '</b> from <b>' + this.objReceive.sndr_name + '</b>?',
      button_cancel_text: 'Cancel',
      button_confirm_text: this.utility.getMessageUsability('confirm_request_money'),
      checkbox_confirm: false,
    };
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        const objRequest: any = this.objReceive;
        objRequest.rec_token = this.userService.getToken();
        objRequest.rec_name = this.userService.getFullName();
        objRequest.rec_email = this.userService.getEmail();
        objRequest.metadata = {
          description: this.objReceive.description
        };
        this.http.post<any>(this.host + '/invoice/customer/create', objRequest)
          .subscribe(
            response => {
              if (response.success) {
                this.errorService.getMessageSuccess(response, this.messages.get('REQUEST_CHECK_SUCCESSFULLY_SENT'));
                this.closeModal();
                this.isLoading = false;
                scrollTo(0, 20);
                this.initSendAndRequestForms();
              }
            },
            err => {
              if (err.error.error) {
                this.errorService.getMessageError(err.error);
              }
            }
          );
      }
    });
  }

  getListCustomers(event: any = null) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;

    const objRequest = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    };

    setTimeout(() => this.errorService.clearAlerts(), 3000);
    let url = '/dwl/customer/list';
    if (this.userService.isMerchant()) {
      url = '/dwl/customer/owner/customer/list';
    }
    this.http.get<any>(this.host + url, {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listCustomers = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
            this.paginationService.generateFilterForLocalStorage(this.storageFilterName);
          }
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.isLoading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  getMerchantFundSources() {
    this.errorService.clearAlerts();
    const objRequest = <any> {
      verified: '1',
      u_token: this.userService.getToken(),
      balance: 0
    };
    this.http.get<any>(this.host + '/dwl/customer/funding-source/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.lstFundSources = <any> response.list;
            if (this.lstFundSources.length) {
              this.objSend.fs_token = this.lstFundSources[0].id;
              this.selectSourceBankAccount();
            }
          }
        },
        err => {
          if (err.error.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }

  selectSourceBankAccount() {
    let routind_number = '';
    let account_number = '';
    let bank_name = '';
    const fs_token = this.objSend.fs_token;
    this.lstFundSources.forEach(function (elem) {
      if (elem.id == fs_token) {
        routind_number = elem.account ? elem.account.routing : '000000000';
        account_number = elem.account ? elem.account.number : '*****0000';
        bank_name = elem.bank_info ? elem.bank_info.name : '';

      }
    });
    this.objSend.routing_number = routind_number;
    this.objSend.account_number = account_number;
    this.objSend.bank_name = bank_name;
  }

  addNewCustomer() {
    this.errorService.clearAlerts();

    if (this.modelNewCustomer.accountNumber != this.modelNewCustomer.cAccountNumber) {
      this.errorService.getMessageError({message: this.messages.get('ACCOUNT_NUMBER_DOES_NOT_MATCH_THE_CONFIRM_ACCOUNT_NUMBER')});
      return;
    }
    this.isLoading = true;

//    console.log(this.modelNewCustomer)

    this.http.post<any>(this.host + '/dwl/customer/owner/customer/create', {
      email: this.modelNewCustomer.email,
      firstName: this.modelNewCustomer.firstName,
      lastName: this.modelNewCustomer.lastName,
      u_token: this.userService.getToken(),
      accountNumber: this.modelNewCustomer.accountNumber,
      bankAccountType: this.modelNewCustomer.bankAccountType,
      cAccountNumber: this.modelNewCustomer.cAccountNumber,
      routingNumber: this.modelNewCustomer.routingNumber,
      phone: this.modelNewCustomer.phone,
      name: this.modelNewCustomer.name

    })
      .subscribe(
        response => {
          if (response.success) {
            //            console.log(response)
            this.closeModal();
            this.isLoading = false;
            this.errorService.getMessageSuccess(response, this.messages.get('CUSTOMER_ADDED_SUCCESSFULLY'));
            this.getListCustomers(null);
            scrollTo(0, 20);
          }
        },
        errResponse => {
          if (errResponse.error.error) {
            this.isLoading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  clearMessages() {
    this.isModalError = this.isError = this.isModalError = this.isSuccess = false;
    this.successMessage = this.errorMessage = this.errorModalMessage = '';
  }

  openSendDialog(content: any, fs_obj: any) {
    this.objSend.name = fs_obj.name;
    this.objSend.email = fs_obj.email;
    this.errorService.clearAlerts();
    this.modalRef = this.modalService.open(content);
  }
  openReceiveDialog(content: any, fs_obj: any) {
    this.objReceive.sndr_name = fs_obj.name;
    this.objReceive.sndr_email = fs_obj.email;
    this.errorService.clearAlerts();
    this.modalRef = this.modalService.open(content);
  }

  closeModal() {
    this.modalRef.close();
  }

}
