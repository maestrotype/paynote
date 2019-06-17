import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {NgForm} from '@angular/forms';
import {MatDialog} from "@angular/material";
import {UserService} from '../../_services/user.service';

@Component({
  selector: 'app-dwolla-transactions',
  templateUrl: './dwolla-transactions.component.html',
  styleUrls: ['./dwolla-transactions.component.css']
})
export class DwollaTransactionsComponent implements OnInit {

  public host: string;
  public listTransactions: any;
  public transactionInfo: any;
  public errorMessage: string;
  public isError: boolean;
  public objUser: any;

  public successMessage: string;
  public isSuccess: boolean;
  public modalRef: NgbModalRef;

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    public dialog: MatDialog,
    private userService: UserService
  ) {          // set token if saved in local storage
    this.host = environment.host;
    this.isError = false;
  }

  ngOnInit() {
    this.objUser = <any> JSON.parse(localStorage.getItem('currentUser'));
    this.getListTransactions();
  }

  getListTransactions() {
    this.http.get<any>(this.host + '/dwl/customer/transfer/list', {params: {u_token: this.objUser.user.u_token}})
      .subscribe(
        response => {
          if (response.success) {
            let isCus = this.userService.isCustomer();
            let a = [];
            response.list.data.forEach(function (item) {
              if (isCus) { //kostyl`
                if (item.source.id === undefined) {
                  item.method = 'from';
                  item.transactions_name = item.destination.name;
                } else {
                  item.method = 'from';
                  item.transactions_name = item.source.name;
                }             

              } else {
                if (item.source.id === undefined) {
                  item.method = 'to';
                  item.transactions_name = item.destination.name;
                } else {
                  item.method = 'from';
                  item.transactions_name = item.source.name;
                }
              }
              a.push(item);
            });
            this.listTransactions = <any> a;
//            console.log(this.listTransactions);
          }
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.isError = errResponse.error.error;
            this.errorMessage = errResponse.error.message;
          }
        }
      );
  }

  //  openDialogMerchantTransInfo(content: any) {
  //    this.modalRef = this.modalService.open(content);
  //  }

  getTransactionsInfoPopup(transfer_id: string | string[], content: any) {
    this.http.get<any>(this.host + '/dwl/customer/transfer', {params: {transfer: transfer_id}})
      .subscribe(
        response => {
          if (response.success) {
            this.modalRef = this.modalService.open(content);
            let objTransfer = [];
            objTransfer.push(response.transfer);
            if (objTransfer[0].source.id === undefined) {
              objTransfer[0].method = 'to';
              objTransfer[0].transactions_name_to = objTransfer[0].destination.name;
              objTransfer[0].transactions_name_from = objTransfer[0].source.name;
            } else {
              objTransfer[0].method = 'from';
              objTransfer[0].transactions_name_from = objTransfer[0].source.name;
              objTransfer[0].transactions_name_to = objTransfer[0].destination.name;
            }
            this.transactionInfo = <any> objTransfer[0];
          }
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.isError = errResponse.error.error;
            this.errorMessage = errResponse.error.message;
          }
        }
      );
  }

}
