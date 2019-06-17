import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {ErrorService} from '../../_services/error.service';

@Component({
  selector: 'app-merchant-transactions',
  templateUrl: './merchant-transactions.component.html',
  styleUrls: ['./merchant-transactions.component.css']
})
export class MerchantTransactionsComponent implements OnInit {

  public host: string;
  public listTransactions: any;
  public errorMessage: string;
  public isError: boolean;
  
  public successMessage: string;
  public isSuccess: boolean;
  public isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    public errorService: ErrorService
    ) {          
    // set token if saved in local storage
    this.host = environment.host;
    this.isError = false;
  }

  ngOnInit() {
    this.getListTransactions()
  }
  
  getListTransactions() {
    this.http.get<any>(this.host + '/dwl/account/transfers/list' )
      .subscribe( 
        response => {
          console.log(response);
          if (response.success ) {
            this.listTransactions = <any>response.list.data
          }
        },
        errResponse => {
          if( errResponse.error != undefined ) {
            this.isLoading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

}
