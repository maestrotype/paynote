import { Component, OnInit, Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {NgForm} from '@angular/forms';
import {MatDialog} from "@angular/material";
import {DeleteConfirmDialogComponent} from '../delete-confirm-dialog/delete-confirm-dialog.component';
import {MessagesService} from '../../_services/messages.service';
//import {NgForm, AbstractControl, NG_VALIDATORS, NgModel, ValidationErrors, Validator, ValidatorFn, Validators} from '@angular/forms';

//@Directive({
//  selector: '[fieldMatches]',
//  providers: [{
//    provide: NG_VALIDATORS,
//    useExisting: FieldMatchesValidatorDirective,
//    multi: true
//  }]
//})
//
//export class FieldMatchesValidatorDirective implements Validator, OnChanges {
//  @Input() fieldMatches: NgModel;
// 
//  private validationFunction = Validators.nullValidator;
// 
//  ngOnChanges(changes: SimpleChanges): void {
//    let change = changes['fieldMatches'];
//    if (change) {
//      const otherFieldModel = change.currentValue;
//      this.validationFunction = fieldMatchesValidator(otherFieldModel);
//    } else {
//      this.validationFunction = Validators.nullValidator;
//    }
//  }
// 
//  validate(control: AbstractControl): ValidationErrors | any {
//    return this.validationFunction(control);
//  }
//}
// 
//export function fieldMatchesValidator(otherFieldModel: NgModel): ValidatorFn {
//  return (control: AbstractControl): ValidationErrors => {
//    return control.value === otherFieldModel.value ? null : {'fieldMatches': {match: false}};
//  };
//}

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit {
  
  public host: string;
  public objCustomer: any;
  public lstCustTransaction: any;
  public lstCustFundSources: any;
  public lstCustDocuments: any;
  public errorMessage: string;
  public isError: boolean;
  public errorModalMessage: string;
  public isModalError: boolean;
  public modelNewFundSource: any;
  
  public successMessage: string;
  public isSuccess: boolean;
  public modalRef: NgbModalRef;
  closeResult: string;

  constructor( 
      private http: HttpClient, 
      private router: ActivatedRoute,
      private modalService: NgbModal,
      public messages: MessagesService,
      public dialog : MatDialog ) {
    this.host = environment.host;
    this.isError = false;
    this.modelNewFundSource = {
      name: '',
      bankAccountType: 'checking',
      routingNumber: '',
      accountNumber: '',
      re_account_number: '',
      dwl_token: ''
    }
  }

  ngOnInit() {
    const id = this.router.snapshot.paramMap.get('id');
    this.getCustomerDetail( id )
  }
  
  openAddSourceModal(content:any) {
    this.modalRef = this.modalService.open(content)
//      .result.then((result) => {
//      console.log( result )
//      this.closeResult = "Closed with: " + result;
//    }, (reason) => {
//       console.log( reason );
//      this.closeResult = 'Dismissed ' + this.getDismissReason(reason);
//    });
  }
  openDialogDeactivateModal(content:any) {
    this.modalRef = this.modalService.open(content);
  }
  
  closeModal() {
    this.modalRef.close();
  }
  
  private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  'with: ${reason}';
    }
  }
  
  getCustomerDetail( id: string | string[]  ) {
    if (!this.objCustomer ) {
      this.http.get<any>(this.host + '/dwl/customer/retrieve', { params: {dwl_token: id} } )
        .subscribe( 
          response => {
            if (response.success ) {
              this.objCustomer = <any>response.customer
            }
          },
          errResponse => {
            if( errResponse.error != undefined ) {
              this.isError = errResponse.error.error;
              this.errorMessage = errResponse.error.message;
            }
          }
        );
    }
  }
  
  getCustomerTransactions( id: string | string[] ) {
    if (!this.lstCustTransaction ) {
      this.http.get<any>(this.host + '/dwl/customer/transfer/list', { params: {dwl_token: id} } )
        .subscribe( 
          response => {
            if (response.success ) {
              this.lstCustTransaction = <any>response.list.data
            }
          },
          errResponse => {
            if( errResponse.error != undefined ) {
              this.isError = errResponse.error.error;
              this.errorMessage = errResponse.error.message;
            }
          }
        );
    }
  }
  
  getCustomerFundSources(id: string | string[], bForse: boolean = false ) {
    this.clearMessages()
    if (!this.lstCustFundSources || bForse ) {
      this.http.get<any>(this.host + '/dwl/customer/funding-source/list', { params: {dwl_token: id, removed: 'false' } } )
        .subscribe( 
          response => {
            if (response.success ) {
              this.lstCustFundSources = <any>response.list
            }
          },
          errResponse => {
            if( errResponse.error != undefined ) {
              this.isError = errResponse.error.error;
              this.errorMessage = errResponse.error.message;
            }
          }
        );
    }
  }
  
  getCustomerDocuments( id: string | string[] ) {
    this.clearMessages()
    if (!this.lstCustDocuments ) {
      this.http.get<any>(this.host + '/dwl/customer/document/list', { params: {dwl_token: id } } )
        .subscribe( 
          response => {
            console.log(response )
            if (response.success ) {
              this.lstCustDocuments = <any>response.list
            }
          },
          errResponse => {
            if( errResponse.error != undefined ) {
              this.isError = errResponse.error.error;
              this.errorMessage = errResponse.error.message;
            }
          }
        );
    }
  }
  
  deactivateCustomer( isCust: string | string[]) {

    const objRequest = {
      dwl_token: isCust,
      status: 'deactivated'
    }
    this.http.post<any>(this.host + '/dwl/customer/update/status', objRequest )
      .subscribe( 
        response => {
          console.log( response )
          if (response.success ) {
            this.closeModal();
            this.objCustomer = null;
            this.getCustomerDetail( isCust );
            this.isSuccess = true;
            this.successMessage = this.messages.get('CUSTOMER_DEACTIVATED_SUCCESSFULLY');
          }
        },
        errResponse => {
          if( errResponse.error != undefined ) {
            this.isModalError = errResponse.error.error;
            this.errorModalMessage = errResponse.error.message;
          }
        }
      );
  }
  
  removeFundSource(idCust: string | string[], idFundSource: string | string[] ) {
    this.clearMessages()
    this.http.post<any>(this.host + '/dwl/funding-source/remove', { fundingsource: idFundSource } )
      .subscribe( 
        response => {
          console.log( response )
          if (response.success ) {
            this.isSuccess = true;
            this.successMessage = this.messages.get('FUNDING_SOURCE_REMOVED_SUCCESSFULLY');
            this.getCustomerFundSources( idCust, true );
          }
        },
        errResponse => {
          if( errResponse.error != undefined ) {
            this.isModalError = errResponse.error.error;
            this.errorModalMessage = errResponse.error.message;
          }
        }
      );
  }
  
  addFundSources() {
    this.clearMessages()
    if( this.modelNewFundSource.accountNumber != this.modelNewFundSource.re_account_number ) {
      this.errorModalMessage = this.messages.get('ACCOUNT_NUMBER_AND_RE-ENTER_ACCOUNT');
      this.isModalError = true;
      return;
    }

    this.modelNewFundSource.dwl_token = this.objCustomer.id;
    this.http.post<any>(this.host + '/dwl/customer/funding-source/create', this.modelNewFundSource )
      .subscribe( 
        response => {
          if (response.success ) {
            this.closeModal();
            this.isSuccess = true;
            this.successMessage = this.messages.get('FUNDING_SOURCE_ADDED_SUCCESSFULLY');
            this.getCustomerFundSources( this.objCustomer.id, true );
          }
        },
        errResponse => {
          if( errResponse.error != undefined ) {
            this.isModalError = errResponse.error.error;
            this.errorModalMessage = errResponse.error.message;
          }
        }
      );
  }
  
  
  isVerified() {
    if(this.objCustomer) {
      if( this.objCustomer.status == 'verified' ) {
        return true
      }
      return false
    }
  }
  
  clearMessages() {
    this.isModalError = this.isError = this.isModalError = false;
    this.successMessage = this.errorMessage = this.errorModalMessage = '';
  }

}
