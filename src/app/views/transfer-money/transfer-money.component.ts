import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserService } from '../../_services/user.service';
import { ErrorService } from '../../_services/error.service';
import {JqueryService} from '../../_services/jquery.service';
import {MessagesService} from '../../_services/messages.service';

@Component({
  selector: 'app-transfer-money',
  templateUrl: './transfer-money.component.html',
  styleUrls: ['./transfer-money.component.css']
})
export class TransferMoneyComponent implements OnInit {
  
  public objTransfer: any;
  public lstFundSources: any;
  public host: string;
  

  constructor(
    private http: HttpClient,
    private userService: UserService,
    public errorService: ErrorService,
    public messages: MessagesService,
    public jqueryService: JqueryService
  ) { 
    this.host = environment.host;
  }

  ngOnInit() {
    this.getMerchantFundSources();
  }


  getMerchantFundSources(bForse: boolean = false) {
    this.errorService.clearAlerts();
    if (!this.lstFundSources || bForse) {
      let objRequest = {
        dwl_token: this.userService.getDwlToken(), 
        removed: 'false', 
        u_token: this.userService.getToken()
      }
      this.http.get<any>(this.host + '/dwl/customer/funding-source/list', {params: objRequest })
        .subscribe(
          response => {
            if (response.success) {
              this.lstFundSources = <any> response.list
            }
          },
          err => {
            if (err.error.error) {
              this.errorService.getMessageError( err.error );
            }
          }
        );
    }
  }
}
