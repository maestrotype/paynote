import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog} from "@angular/material";
import {UserService} from '../../_services/user.service';
import {ErrorService} from '../../_services/error.service';
import {MessagesService} from '../../_services/messages.service';
import {Utility} from '../../_helpers/utility';
import {PaginationService} from '../../_services/pagination.service';

@Component({
  selector: 'app-campaign-statistic',
  templateUrl: './campaign-statistic.component.html',
  styleUrls: ['./campaign-statistic.component.css']
})
export class CampaignStatisticComponent implements OnInit {

  public host: string = environment.host;
  public loading: boolean = false;
  public lstCampaignStatistic: any = [];
  public lstCampaignStatisticDetails: any = [];
  public campaignStatisticPeriod: any = {
    period: 30
  }
  public pageSize: any;
  public pageNo: any;
  
  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    public dialog: MatDialog,
    public userService: UserService,
    public errorService: ErrorService,
    public messages: MessagesService,
    public utility: Utility,
    public paginationService: PaginationService
  ) {}

  ngOnInit() {
    this.paginationService.searchQuery = ''
    this.getCampaignStatistic()
  }

  getCampaignStatistic( event: any = null ) {
    this.lstCampaignStatisticDetails = [];
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;
    
    this.loading = true;
    this.errorService.clearAlerts();
    let objRequest = {
      days_ago: this.campaignStatisticPeriod.period,
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }
    this.http.get<any>(this.host + '/campaign/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.lstCampaignStatistic = response.list.data
            this.paginationService.setParamsForResponce(response.list)
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
  
  getCampaignStatisticDetails( objCampaing: any = {} ) {
    this.loading = true;
    this.http.get<any>(this.host + '/campaign/detail/list', {params: objCampaing})
      .subscribe(
        response => {
          if (response.success) {
            this.lstCampaignStatisticDetails = response.list.data
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
}
