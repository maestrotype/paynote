import {Component, OnInit} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {environment} from '../../../environments/environment'
import {UserService} from '../../_services/user.service'
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap'
import {ErrorService} from '../../_services/error.service'
import {PaginationService} from '../../_services/pagination.service'
import {MessagesService} from '../../_services/messages.service'
import {JqueryService} from '../../_services/jquery.service'

@Component({
  selector: 'app-message-suggestion',
  templateUrl: './message-suggestion.component.html',
  styleUrls: ['./message-suggestion.component.css']
})
export class MessageSuggestionComponent implements OnInit {

  public host: string
  public listMessageSuggestion: any = []
  public addNewMessageModel: any
  public messageModel: any
  public errorMessage: string
  public isError: boolean
  public objUser: any
  public loading: boolean
  public objParam: any
  public modelEditTemplate: any
  public isModalError: boolean
  public errorModalMessage: string
  public isLoading: boolean = false
  public isSuccess: boolean = false
  public modalRef: NgbModalRef
  public sortAndPagination: any = []
  public pageSize: any
  public pageNo: any
  public action: string
  
  public objMessageSuggestionComp : any = {
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
    public jqueryService: JqueryService
  ) {
    this.host = environment.host
    this.isError = false
    this.loading = false
    this.addNewMessageModel = {
      code: '',
      key: '',
      note: '',
      type: '',
      value: ''
    }
  }

  ngOnInit() {
    this.paginationService.sortField = 'type'
    this.paginationService.sortDir = 'ASC'
    this.paginationService.searchQuery = ''
    this.errorService.clearAlerts()
    this.objUser = <any> JSON.parse(localStorage.getItem('currentUser'))
  }

  openDialog(content: any, fs_obj: any, action: string) {
    if (action == 'edit') {
      this.addNewMessageModel = fs_obj
    }
    if (action == 'add') {
      this.addNewMessageModel = {
        code: '',
        key: '',
        note: '',
        type: '',
        value: ''
      }
    }
    this.action = action
    this.errorService.clearAlerts()
    this.modalRef = this.modalService.open(content)
  }

  closeModal() {
    this.modalRef.close()
  }

  getMessageSuggestion(event: any = null) {
    this.pageSize = event ? event.pageSize : this.paginationService.pageSize
    this.pageNo = event ? event.pageNo : this.paginationService.pageNo

    let objRequest = {
      limit: event ? event.pageSize : this.paginationService.pageSize,
      page: event ? event.pageNo : this.paginationService.pageNo,
      search: this.paginationService.searchQuery,
      orderby: this.paginationService.sortField,
      direction: this.paginationService.sortDir,
    }

    setTimeout(() => this.errorService.clearAlerts(), 3000)

    this.http.get<any>(this.host + '/message/list', {params: objRequest})
      .subscribe(
        response => {
          if (response.success) {
            //            console.log(response)
            this.listMessageSuggestion = <any> response.list.data
            this.sortAndPagination = response.list
            this.paginationService.setParamsForResponce(this.sortAndPagination)
          }
        },
        errResponse => {
          if (errResponse.error != undefined) {
            this.isLoading = false
            this.errorService.getMessageError(errResponse.error)
          }
        }
      )
  }

  addEditMessage(messageObj: any) {
    this.loading = true
    this.errorService.clearAlerts()
    let url = '/message/add'
    let successMessage = this.messages.get('MESSAGE_ADDED_SUCCESSFULLY')
    if (this.action == 'edit') {
      url = '/message/update'
      successMessage = this.messages.get('MESSAGE_UPDATED_SUCCESSFULLY')
    }
    this.http.post<any>(this.host + url, {
      id: messageObj.id,
      type: messageObj.type,
      key: messageObj.key,
      value: messageObj.value,
      code: messageObj.code,
      note: messageObj.note
    })
      .subscribe(
        response => {
          this.loading = false
          if (response.success) {
            //            console.log(response)
            this.closeModal()
            this.errorService.getMessageSuccess({message: successMessage})
            this.getMessageSuggestion(null)
            scrollTo(0, 20)
          }
        },
        errResponse => {
          this.loading = false
          if (errResponse.error) {
            this.isLoading = false
            this.errorService.getMessageError(errResponse.error)
          }
        }
      )

  }

}