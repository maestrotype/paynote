import {Component, OnInit, Input} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Utility} from '../../_helpers/utility';
import {UserService} from '../../_services/user.service';
import {TransactionService} from '../../_services/transaction.service';
import {JqueryService} from '../../_services/jquery.service';
import {TopAlertsService} from '../../_services/top-alerts.service';

@Component({
  selector: 'app-trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.css']
})
export class TrendsComponent implements OnInit {

  @Input() graphicDataObj: any = {};
  @Input() visibleTrands = false;
  public barChartLabelsw: string[] = [];
  public barChartData: any[] = [
    {
      data: [],
      label: ''
    }
  ];

  public host: string = environment.host;
  public key: string;
  public filderDay = '7';
  public objRequest: any = {};
  public url = '';
  public transfersSent: any = [];
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  constructor(
    private http: HttpClient,
    public utility: Utility,
    public userService: UserService,
    public transService: TransactionService,
    public jqueryService: JqueryService,
    public topAlertsService: TopAlertsService,
  ) {}


  ngOnInit() {
    this.getTrendsData(null);
  }

  loopTrends(keyArray: any) {
    let a: string;
    this.graphicDataObj.forEach(function (item: any, index: any) {
      if (keyArray == item.key) {
        a = index;
      }
    });
    return a;
  }

  setFilter(filter: string = '7') {
    this.filderDay = filter;
    this.getTrendsData(this.key);
  }

  getTrendsData(key: string) {
    this.key = key;

    let graphData = <any> null;

    if (key == null) {
      this.objRequest = {
        u_token: this.userService.getToken(),
        days_ago: this.filderDay,
      };
      this.url = this.graphicDataObj[0].url;
      graphData = this.graphicDataObj[0].labelTitle;
    } else {
      const indexData = this.loopTrends(key);
      this.objRequest = {
        u_token: this.userService.getToken(),
        days_ago: this.filderDay,
      };
      this.url = this.graphicDataObj[indexData].url;
      graphData = this.graphicDataObj[indexData].labelTitle;
    }

    this.http.get<any>(this.host + '/' + this.url, {params: this.objRequest})
      .subscribe(
        response => {
          console.log( response )
          if (response.success) {
            this.barChartLabelsw = <any> response.interval;
            this.barChartData[0].data = <any> response.data;
            this.barChartData[0].label = graphData;

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

  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(4,123,478,0.2)',
      borderColor: 'rgba(4,123,478,1)',
      pointBackgroundColor: 'rgba(251,228,160,1)',
      pointBorderColor: '#000',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)',
      pointBorderWidth: 1
    }
  ];

  // events
  public chartClicked(e: any): void {
//    console.log(e);
  }

  public chartHovered(e: any): void {
//    console.log(e);
  }

}
