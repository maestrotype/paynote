import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import {environment} from '../../../environments/environment'
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router'
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap'
import {NgForm, FormBuilder, FormGroup, Validators} from '@angular/forms'
import {MatDialog} from "@angular/material"
import {Utility} from '../../_helpers/utility'
import {UserService} from '../../_services/user.service'
import {MessagesService} from '../../_services/messages.service'
import {DialogService} from '../../_services/dialog.service'
import {TopAlertsService} from '../../_services/top-alerts.service'

@Component({
  selector: 'app-rules-for-transactions',
  templateUrl: './rules-for-transactions.component.html',
  styleUrls: ['./rules-for-transactions.component.css']
})
export class RulesForTransactionsComponent implements OnInit {

  public host: string;
  public objRule: any = {}
  public objSignUpRules: any = {
    maxmind_risk_score : {},
    maxmind_ip_score : {},
    high_risk_country : {},
    maxmind_carder_email : {},
    same_ip : {},
    same_fingerprint : {},
    amount_more_limits: {},
    same_bank_acc: {}
  }
  public isLoading: boolean = false;
  public modalRef: NgbModalRef;

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    public utility: Utility,
    public userService: UserService,
    public messages: MessagesService,
    public topAlertsService: TopAlertsService,
    public dialogService: DialogService,
    public dialog: MatDialog,
  ) {
    this.host = environment.host
  }

  ngOnInit() {
    this.getSignUpRules()
  }
  
  getSignUpRules() {
    this.http.get<any>(this.host + '/rules/transaction')
      .subscribe(
        response => {
          if (response.success) {
            this.objSignUpRules = response.rule
            this.objRule = response
          }
          this.isLoading = false
        },
        err => {
          this.isLoading = false
          if (err.error) {
            this.topAlertsService.popToast('error', 'Error', err.error.message)
          }
        }
      )
  }
  
  updateSignUpRules() {
    this.http.post<any>(this.host + '/rules/update/transaction', this.objSignUpRules)
      .subscribe(
        response => {
          if (response.success) {
            this.topAlertsService.popToast('success', 'Success', 'Rules for Transactions updated successfully')
          }
          this.isLoading = false
        },
        err => {
          this.isLoading = false
          if (err.error) {
            this.topAlertsService.popToast('error', 'Error', err.error.message)
          }
        }
      )
  }
  
  updateStatusSignUpRule() {
    const statusRule = this.objRule.enabled
    let message = 'Are you sure you want to ' + (statusRule == 1 ? 'disable' : 'enable' ) + ' Rules for Transactions ?'
    let objDataDialog = {
      title: 'Please confirm',
      text: message,
      button_cancel_text: 'Cancel',
      button_confirm_text: statusRule == 1 ? 'Disable' : 'Enable',
      checkbox_confirm: true,
      checkbox_confirm_text: 'Please confirm',
    }
    
    this.dialogService.openDialog(objDataDialog).afterClosed().subscribe(result => {
      if (result) {
        let url = '/rules/transaction/' + (statusRule == 1 ? 'disable' : 'enable')
        this.http.get<any>(this.host + url)
          .subscribe(
            response => {
              if (response.success) {
                this.objSignUpRules = response.rule
                this.objRule = response
                this.topAlertsService.popToast('success', 'Success', 'Rules for Transactions updated successfully')
              }
              this.isLoading = false
            },
            err => {
              this.isLoading = false
              if (err.error) {
                this.topAlertsService.popToast('error', 'Error', err.error.message)
              }
            }
          )
      } else {
        this.isLoading = false
      }
    })
  }

}
