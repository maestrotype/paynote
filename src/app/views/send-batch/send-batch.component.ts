import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../environments/environment';
import {UserService} from '../../_services/user.service';
import {ErrorService} from '../../_services/error.service';
import {JqueryService} from '../../_services/jquery.service';
import {Utility} from '../../_helpers/utility';
import {MerchantService} from '../../_services/merchant.service';
import {MessagesService} from '../../_services/messages.service';
import {UploadBatch} from '../../_helpers/upload-batch';
import {Uploader} from '../../_helpers/uploader/uploader';
import {PaginationService} from '../../_services/pagination.service';
import {TopAlertsService} from '../../_services/top-alerts.service';

@Component({
  selector: 'app-send-batch',
  templateUrl: './send-batch.component.html',
  styleUrls: ['./send-batch.component.css'],
  providers: [PaginationService, ErrorService],
})
export class SendBatchComponent implements OnInit {

  public objSend: any = {
    batch_type: 'regular',
    u_token: this.userService.getToken()
  };
  public lstFundSources: any;

  public listBatch: any = [];
  public batchDetails: any;
  public loading = false;
  public host: string = environment.host;

  public isLoading = false;
  public pageSize: any;
  public pageNo: any;
  public modalRef: NgbModalRef;

  constructor(
    private http: HttpClient,
    public userService: UserService,
    public errorService: ErrorService,
    public jqueryService: JqueryService,
    public utility: Utility,
    private route: Router,
    private modalService: NgbModal,
    public dialog: MatDialog,
    public messages: MessagesService,
    public merchantService: MerchantService,
    public uploaderService: Uploader,
    public paginationService: PaginationService,
    public topAlertsService: TopAlertsService,
  ) {}

  ngOnInit() {
    this.errorService.clearAlerts();
    this.getFundSources();
    this.paginationService.searchQuery = '';
  }

  getFundSources() {
    this.merchantService.getFundSources({verified: '1', u_token: this.userService.getToken(), balance: 0})
      .subscribe(
        response => {
          if (response.success) {
            this.lstFundSources = <any> response.list;
            if (this.lstFundSources.length) {
              this.objSend.fs_token = this.lstFundSources[0].id;
            }
          }
        },
        err => {
          if (err.error) {
            this.errorService.getMessageError(err.error);
          }
        }
      );
  }


  getBatchList(event: any = null) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;

    setTimeout(() => this.errorService.clearAlerts(), 3000);
    const objRequest = {
      u_token: this.userService.getToken(),
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    };
    this.http.get<any>(this.host + '/dwl/customer/payment-link/batch/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.listBatch = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }
  getBatchDetails(batch_token: any = null) {

    setTimeout(() => this.errorService.clearAlerts(), 3000);
    const objRequest = {
      batch_token: batch_token
    };
    this.http.get<any>(this.host + '/dwl/customer/payment-link/batch/details', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.batchDetails = <any> response.list;

          }
        },
        errResponse => {
          if (errResponse.error) {
            this.loading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }


  onFileChange() {

    if ( !this.userService.canSendAction() ) {
      this.topAlertsService.popToast('error', 'Error', this.messages.get('MESSAGE_PLAN_PAYMENT_IS_NOT_COMPLITED'));
      return;
    }

    const uploadFile = (<HTMLInputElement> window.document.getElementById('batchSendInput')).files[0];
    if ( uploadFile === undefined) {
      return;
    }

    const PayNoteUploadItem = new UploadBatch(uploadFile, this.userService);
    PayNoteUploadItem.formData = this.objSend;

    this.uploaderService.onSuccessUpload = () => {
      this.isLoading = false;
      this.errorService.getMessageSuccess({message: 'Batch uploaded successfully'});
      scrollTo(0, 20);
      this.getBatchList();
    };
    this.uploaderService.onErrorUpload = (item, response) => {
      this.isLoading = true;
      this.errorService.getMessageError({message: response.message});
      scrollTo(0, 20);
    };
    this.uploaderService.onCompleteUpload = () => {};
    this.uploaderService.upload(PayNoteUploadItem);
  }

  closeModal() {
    this.modalRef.close();
  }

  openModal(content: any, batch: any = null) {
    this.errorService.clearAlerts();
    this.getBatchDetails(batch);
    this.modalRef = this.modalService.open(content, {size: 'lg', windowClass: 'butchDetails'});
  }

}
