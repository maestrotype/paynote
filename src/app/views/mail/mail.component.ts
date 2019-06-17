import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../_services/user.service';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {NgForm, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from "@angular/material";
import {ErrorService} from '../../_services/error.service';
import {PaginationService} from '../../_services/pagination.service';
import {MessagesService} from '../../_services/messages.service';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent implements OnInit {

  public host: string;
  public listMail: any = [];
  public descriptionMail: any = [];
  public descriptionMailEdit: any = [];
  public modelNewCustomer: any;
  public errorMessage: string;
  public isError: boolean;
  public objUser: any;
  public objParam: any;
  public modelEditTemplate: any;
  public isModalError: boolean;
  public errorModalMessage: string;
  public isLoading: boolean = false;
  public isSuccess: boolean = false;
  public modalRef: NgbModalRef;
  public sortAndPagination: any = [];
  public successMessage: string;
  public replaceLink: string = '/assets/img/check.png';
  public replaceObj: string = '{{img_check}}';
  public pageSize: any;
  public pageNo: any;
  public objMailComp : any = {
    editorConfig: <any> {
      "toolbar": [
          ["bold", "italic", "underline", "strikeThrough", "fontSize", "color", "justifyLeft", "justifyCenter", "justifyRight",
            "justifyFull", "undo", "redo","paragraph", "blockquote", "removeBlockquote", "horizontalLine", "orderedList",
            "unorderedList","link"]
      ]
    }
  }

  constructor(
    private http: HttpClient,
    public errorService: ErrorService,
    private modalService: NgbModal,
    private userService: UserService,
    public paginationService: PaginationService,
    public messages: MessagesService,
  ) {
    this.host = environment.host;
    this.isError = false;
    this.modelEditTemplate = {
      name: '',
      from: '',
      from_name: '',
      cc: '',
      bcc: '',
      subject: '',
      body: ''
    };
  }

  ngOnInit() {
    this.errorService.clearAlerts()
    this.objUser = <any> JSON.parse(localStorage.getItem('currentUser'));
    this.paginationService.sortField = 'id';
    this.paginationService.sortDir = 'ASC';
    this.paginationService.searchQuery = ''
  }

  openMailTemplateViewModal(content: any, fs_obj: any) {
    this.descriptionMail = fs_obj;
    this.modalRef = this.modalService.open(content, {size: "lg"});

  }

  openMailTemplateEditModal(content: any, fs_obj: any) {
    this.modelEditTemplate = fs_obj;
    if (this.modelEditTemplate.body != null) {
      this.modelEditTemplate.body = this.modelEditTemplate.body.replace(this.replaceObj, this.replaceLink);
    }
    this.modalRef = this.modalService.open(content, {size: "lg"});
  }

  //  applySort(sortFieldName: string, sortsDir: string) {
  //    if (sortFieldName == this.paginationService.sortField) {
  //      if (sortsDir == 'DESC') {
  //        this.paginationService.sortDir = 'ASC';
  //        this.paginationService.sortIcons = false;
  //      } else {
  //        this.paginationService.sortDir = 'DESC';
  //        this.paginationService.sortIcons = true;
  //      }
  //    }
  //    this.paginationService.sortField = sortFieldName;
  //    this.paginationService.pageSize = this.pageSize;
  //    this.paginationService.pageNo = this.pageNo;
  //    this.getListMail(null);
  //  }

  getListMail(event: any) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize;
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo;

    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }

    setTimeout(() => this.errorService.clearAlerts(), 3000);

    this.http.get<any>(this.host + '/mail/template/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            //            console.log(response);
            this.listMail = <any> response.list.data;
            this.paginationService.setParamsForResponce(response.list);
          }
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.isLoading = false;
            this.errorService.getMessageError(errResponse.error);
          }
        }
      );
  }

  updateEmailTemplate() {
    setTimeout(() => this.errorService.clearAlerts(), 3000);
    let objRequest: any = this.modelEditTemplate;
    objRequest.body = objRequest.body.replace(this.replaceLink, this.replaceObj);

    this.http.post<any>(this.host + '/mail/template/update', objRequest)
      .subscribe(
        response => {
          if (response.success) {
            //            console.log(response);
            this.closeModal();
            this.isLoading = false;
            scrollTo(0, 20);
            this.errorService.getMessageSuccess({message: this.messages.get('MAIL_TEMPLATE_SUCCESSFULLY_SAVE')});
          }
        },
        err => {
          if (err.error.error) {
            this.isLoading = false;
            this.errorService.getMessageError(err.error.error);
          }
        }
      );
  }

  clearMessages() {
    this.isModalError = this.isError = this.isModalError = this.isSuccess = false;
    this.successMessage = this.errorMessage = this.errorModalMessage = '';
  }

  closeModal() {
    this.modalRef.close();
  }

}
