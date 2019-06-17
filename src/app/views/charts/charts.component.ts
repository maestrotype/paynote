import {Component, OnInit, Input, OnChanges, SimpleChange} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Utility} from '../../_helpers/utility';
import {UserService} from '../../_services/user.service';
import {TransactionService} from '../../_services/transaction.service';
import {JqueryService} from '../../_services/jquery.service';
import {TopAlertsService} from '../../_services/top-alerts.service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})


export class ChartsComponent implements OnInit {

  @Input() graphicDataObj: any = [];
  public barChartLabelsw: string[] = [];
  public barChartData: any = [
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

  getTrendsData(key: string) {
    this.key = key;

    let graphData = <any> null;

    if (key == null) {
      this.objRequest = this.graphicDataObj[0].request;
      this.url = this.graphicDataObj[0].url;
      graphData = this.graphicDataObj[0].labelTitle;
    } else {
      const indexData = this.loopTrends(key);
      this.objRequest = this.graphicDataObj[indexData].request;
      this.url = this.graphicDataObj[indexData].url;
      graphData = this.graphicDataObj[indexData].labelTitle;
    }

    this.http.get<any>(this.host + this.url, {params: this.objRequest})
      .subscribe(
        response => {
          if (response.success) {
            this.barChartLabelsw = <any> response.interval;
            this.barChartData[0].data = <any> response.data;
            this.barChartData[0].label = graphData;
            if ( this.url == '/ml/average' ) {
              this.barChartData.push( {data: response.data_high, label: 'Intelligent search frauds (%) v2'} );
            }
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
    },
    {
      backgroundColor: 'rgba(20,255,152,0.2)',
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
    //    console.log(e)
  }

  public chartHovered(e: any): void {
    //    console.log(e)
  }

}

