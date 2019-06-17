import { Component, OnInit } from '@angular/core';
import {Utility} from '../../_helpers/utility';
import {TopAlertsService} from '../../_services/top-alerts.service';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import * as moment from 'moment';
import {CurrencyPipe} from '@angular/common';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ErrorService} from '../../_services/error.service';

@Component({
  selector: 'app-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.css']
})
export class DashboardAnalyticsComponent implements OnInit {

  public host: string = environment.host;
  public toggleViewGraph = false;
  public graphAnalyticsName: any = {
    graphName: '',
    graphNameInPopup: ''
  };
  public modalRef: NgbModalRef;
  public objRequest: any = {
    interval: 'day',
    date_start: moment().startOf('month').format('YYYY-MM-DD'),
    date_end: moment().endOf('month').format('YYYY-MM-DD'),
    days_ago: ''
  };
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(4,123,478,0)',
      borderColor: 'rgba(4,123,478,1)',
      pointBackgroundColor: 'rgba(4,123,478,1)',
      pointBorderColor: '#047bf8',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(4,123,478,0.8)',
      pointBorderWidth: 1
    }
  ];
  public objDashboardAnalyticsComp: any = {
    dateRangeSelected: {
      start: moment().startOf('month'),
      end: moment().endOf('month')
    },
    amount_total : '',
    dateLocale: {
      format: 'MM/DD/YYYY',
      direction: 'ltr', // could be rtl
      weekLabel: 'W',
      separator: ' To ', // default is ' - '
      cancelLabel: 'Cancel', // detault is 'Cancel'
      applyLabel: 'Apply', // detault is 'Apply'
      customRangeLabel: 'Custom range',
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: 1 // first day is monday
    },
    dateRanges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      // 'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      // 'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month (MTD)': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
      'Last Quarter': [moment().startOf('quarter'), moment().endOf('quarter')],
      'This Year': [moment().startOf('year'), moment().endOf('year')]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************activeMerchants************************************************************************************/
    activeMerchants: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMerchant },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    activeMerchantsForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMerchant }
        }
      },
      barChartData: [ { data: [], label: '' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************revenueSubscriptions************************************************************************************/
    revenueSubscriptions: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    revenueSubscriptionsForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney }
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************processingVolume************************************************************************************/
    processingVolume: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    processingVolumeForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney }
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************processingRevenue************************************************************************************/
    processingRevenue: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    processingRevenueForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney }
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************failedPaymentFees************************************************************************************/
    failedPaymentFees: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    failedPaymentFeesForPopup: {
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney }
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************totalRevenue************************************************************************************/
    totalRevenue: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    totalRevenueForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney }
        }
      },
      barChartData: [] = [ { data: [], label: 'Total Revenue' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************plaidAuth************************************************************************************/
    plaidAuth: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    plaidAuthForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney }
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************plaidBalance************************************************************************************/
    plaidBalance: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    plaidBalanceForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney }
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************failedPayments************************************************************************************/
    failedPayments: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    failedPaymentsForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney }
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************cipBusiness************************************************************************************/
    cipBusiness: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    cipBusinessForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney }
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    // tslint:disable-next-line:max-line-length
    /***********************************************************************************cipPersonal************************************************************************************/
    cipPersonal: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          xAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: { display: false },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    },
    cipPersonalForPopup: {
      amount_total : '',
      barChartOptions: {
        scaleShowVerticalLines: false,
        responsive: true,
        legend: false,
        scales: {
          yAxes: [{
            ticks: { callback: (value) => '$' + value }
          }]
        },
        tooltips: {
          callbacks: { label: this.transformTooltipToMoney },
          yPadding: 10,
          xPadding: 10,
          titleFontSize: 14,
          bodyFontSize: 17,
          displayColors: false,
        }
      },
      barChartData: [] = [ { data: [], label: '' }]
    }
  };

  constructor(
    private http: HttpClient,
    public utility: Utility,
    public topAlertsService: TopAlertsService,
    private currencyPipe: CurrencyPipe,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    // this.getAnalitics();
  }

  choosedDate( event: any = null ) {
    this.objRequest.interval = 'day';
    moment(event.startDate).format('YYYY-MM-DD') !== 'Invalid date'
      ? this.objRequest.date_start = moment(event.startDate).format('YYYY-MM-DD')
      : this.objRequest.date_start = moment().startOf('month').format('YYYY-MM-DD');
    moment(event.endDate ).format('YYYY-MM-DD') !== 'Invalid date'
      ? this.objRequest.date_end = moment(event.endDate).format('YYYY-MM-DD')
      : this.objRequest.date_end = moment().endOf('month').format('YYYY-MM-DD');
    this.getAnalitics();


    // start: moment().startOf('month'),
    //   end: moment().endOf('month')
  }

  openModal(content: any, graphName: any, graphNameInPopup: string) {
    this.graphAnalyticsName.graphName = graphName;
    this.graphAnalyticsName.graphNameInPopup = graphNameInPopup;
    this.toggleViewGraph = true;
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.modalRef = this.modalService.open(content, {size: 'lg'});
  }
  closeModal() {
    this.modalRef.close();
  }

  transformTooltipToMoney( tooltipItem: any = null, data: any = null ) {
    let label = data.datasets[tooltipItem.datasetIndex].label || '';
    label += '$';
    label += tooltipItem.yLabel;
    return label;
  }
  transformTooltipToMerchant( tooltipItem: any = null, data: any = null ) {
    let label = data.datasets[tooltipItem.datasetIndex].label || '';
    label += tooltipItem.yLabel;
    return label;
  }

  getAnalitics() {
    this.getActiveMerchants();
    this.getRevenueSubscriptions();
    this.getProcessingVolume();
    this.getProcessingRevenue();
    this.getFailedPaymentFees();
    this.getTotalRevenue();
    this.getPlaidAuth();
    this.getPlaidBalance();
    this.getFailedPayments();
    this.getCipBusiness();
    this.getCipPersonal();
    // console.log( this.objDashboardAnalyticsComp );
  }

  // dateRangeClicked( event: any = null ) {
  //   console.log(event)
  // }

  getActiveMerchants() {
    this.http.get<any>(this.host + '/analytics/active/merchants', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            console.log(response);
            this.objDashboardAnalyticsComp.activeMerchants.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.activeMerchantsForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.activeMerchants.amount_total = response.total;
            this.objDashboardAnalyticsComp.activeMerchantsForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.activeMerchants = Object.assign( this.objDashboardAnalyticsComp.activeMerchants, response );
            this.objDashboardAnalyticsComp.activeMerchantsForPopup = Object.assign( this.objDashboardAnalyticsComp.activeMerchantsForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  getRevenueSubscriptions() {
    this.http.get<any>(this.host + '/analytics/revenue/subscriptions', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objDashboardAnalyticsComp.revenueSubscriptions.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.revenueSubscriptionsForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.revenueSubscriptions.amount_total = response.total;
            this.objDashboardAnalyticsComp.revenueSubscriptionsForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.revenueSubscriptions = Object.assign( this.objDashboardAnalyticsComp.revenueSubscriptions, response );
            // tslint:disable-next-line:max-line-length
            this.objDashboardAnalyticsComp.revenueSubscriptionsForPopup = Object.assign( this.objDashboardAnalyticsComp.revenueSubscriptionsForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  getProcessingVolume() {
    this.http.get<any>(this.host + '/analytics/processing/volume', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objDashboardAnalyticsComp.processingVolume.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.processingVolumeForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.processingVolume.amount_total = response.total;
            this.objDashboardAnalyticsComp.processingVolumeForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.processingVolume = Object.assign( this.objDashboardAnalyticsComp.processingVolume, response );
            this.objDashboardAnalyticsComp.processingVolumeForPopup = Object.assign( this.objDashboardAnalyticsComp.processingVolumeForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  getProcessingRevenue() {
    this.http.get<any>(this.host + '/analytics/processing/revenue', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objDashboardAnalyticsComp.processingRevenue.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.processingRevenueForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.processingRevenue.amount_total = response.total;
            this.objDashboardAnalyticsComp.processingRevenueForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.processingRevenue = Object.assign( this.objDashboardAnalyticsComp.processingRevenue, response );
            this.objDashboardAnalyticsComp.processingRevenueForPopup = Object.assign( this.objDashboardAnalyticsComp.processingRevenueForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  getFailedPaymentFees() {
    this.http.get<any>(this.host + '/analytics/failed/paymentfees', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objDashboardAnalyticsComp.failedPaymentFees.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.failedPaymentFeesForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.failedPaymentFees.amount_total = response.total;
            this.objDashboardAnalyticsComp.failedPaymentFeesForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.failedPaymentFees = Object.assign( this.objDashboardAnalyticsComp.failedPaymentFees, response );
            this.objDashboardAnalyticsComp.failedPaymentFeesForPopup = Object.assign( this.objDashboardAnalyticsComp.failedPaymentFeesForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  getTotalRevenue() {
    this.http.get<any>(this.host + '/analytics/total/revenue', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.objDashboardAnalyticsComp.totalRevenue.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.totalRevenueForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.totalRevenue.amount_total = response.total;
            this.objDashboardAnalyticsComp.totalRevenueForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.totalRevenue = Object.assign( this.objDashboardAnalyticsComp.totalRevenue, response );
            this.objDashboardAnalyticsComp.totalRevenueForPopup = Object.assign( this.objDashboardAnalyticsComp.totalRevenueForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  // Analitics Expenses

  getPlaidAuth() {
    this.http.get<any>(this.host + '/analytics/plaid/auth', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            // console.log( response );
            this.objDashboardAnalyticsComp.plaidAuth.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.plaidAuthForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.plaidAuth.amount_total = response.total;
            this.objDashboardAnalyticsComp.plaidAuthForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.plaidAuth = Object.assign( this.objDashboardAnalyticsComp.plaidAuth, response );
            this.objDashboardAnalyticsComp.plaidAuthForPopup = Object.assign( this.objDashboardAnalyticsComp.plaidAuthForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  getPlaidBalance() {
    this.http.get<any>(this.host + '/analytics/plaid/balance', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            // this.objDashboardAnalyticsComp.plaidBalance = response;
            // console.log( response );
            this.objDashboardAnalyticsComp.plaidBalance.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.plaidBalance.amount_total = response.total;
            this.objDashboardAnalyticsComp.plaidBalance = Object.assign( this.objDashboardAnalyticsComp.plaidBalance, response );
            this.objDashboardAnalyticsComp.plaidBalanceForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.plaidBalanceForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.plaidBalanceForPopup = Object.assign( this.objDashboardAnalyticsComp.plaidBalanceForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  getFailedPayments() {
    this.http.get<any>(this.host + '/analytics/dwl/failed/payments', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            // this.objDashboardAnalyticsComp.failedPayments = response;
            // console.log( response );
            this.objDashboardAnalyticsComp.failedPayments.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.failedPayments.amount_total = response.total;
            this.objDashboardAnalyticsComp.failedPayments = Object.assign( this.objDashboardAnalyticsComp.failedPayments, response );
            this.objDashboardAnalyticsComp.failedPaymentsForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.failedPaymentsForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.failedPaymentsForPopup = Object.assign( this.objDashboardAnalyticsComp.failedPaymentsForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  getCipBusiness() {
    this.http.get<any>(this.host + '/analytics/dwl/cip/business', {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            // this.objDashboardAnalyticsComp.cipBusiness = response;
            // console.log( response );
            this.objDashboardAnalyticsComp.cipBusiness.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.cipBusiness.amount_total = response.total;
            this.objDashboardAnalyticsComp.cipBusiness = Object.assign( this.objDashboardAnalyticsComp.cipBusiness, response );
            this.objDashboardAnalyticsComp.cipBusinessForPopup.barChartData[0].data = response.list.data;
            this.objDashboardAnalyticsComp.cipBusinessForPopup.amount_total = response.total;
            this.objDashboardAnalyticsComp.cipBusinessForPopup = Object.assign( this.objDashboardAnalyticsComp.cipBusinessForPopup, response );
          }
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }

  getCipPersonal() {
    this.http.get<any>(this.host + '/analytics/dwl/cip/personal', {params: this.objRequest})
      .subscribe(
        response => {
          if (!response.success) {
            return;
          }
          this.objDashboardAnalyticsComp.cipPersonal.barChartData[0].data = response.list.data;
          this.objDashboardAnalyticsComp.cipPersonalForPopup.barChartData[0].data = response.list.data;
          this.objDashboardAnalyticsComp.cipPersonal.amount_total = response.total;
          this.objDashboardAnalyticsComp.cipPersonalForPopup.amount_total = response.total;
          this.objDashboardAnalyticsComp.cipPersonal = Object.assign(this.objDashboardAnalyticsComp.cipPersonal, response);
          this.objDashboardAnalyticsComp.cipPersonalForPopup = Object.assign(this.objDashboardAnalyticsComp.cipPersonalForPopup, response);
        },
        errResponse => {
          this.utility.getMessageError(errResponse.error);
          this.topAlertsService.popToast('error', 'Error', this.utility.errorMessage);
        }
      );
  }
}



// Analytics
// interval {month,day,year}, (date_start & date_end) or days_ago
// Analytics Revenue
// Route::get('analytics/active/merchants',  'AnalyticsController@activeMerchants');
// Route::get('analytics/revenue/subscriptions',  'AnalyticsController@revenueSubscriptions');
// Route::get('analytics/processing/volume',  'AnalyticsController@processingVolume');
// Route::get('analytics/processing/revenue',  'AnalyticsController@processingRevenue');
// Route::get('analytics/failed/paymentfees',  'AnalyticsController@failedPaymentFees');
// Route::get('analytics/total/revenue',  'AnalyticsController@totalRevenue');
// //Analytics Expenses
// Route::get('analytics/plaid/auth',  'AnalyticsController@plaidAuthentication');
// Route::get('analytics/plaid/balance',  'AnalyticsController@plaidBalance');
// Route::get('analytics/dwl/failed/payments',  'AnalyticsController@dwlFailedPayments');
// Route::get('analytics/dwl/cip/business',  'AnalyticsController@dwlCipBusiness');
// Route::get('analytics/dwl/cip/personal',  'AnalyticsController@dwlCipPersonal');
