"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var environment_1 = require("../../../environments/environment");
var user_service_1 = require("../../_services/user.service");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var error_service_1 = require("../../_services/error.service");
var pagination_service_1 = require("../../_services/pagination.service");
var InvoiceComponent = /** @class */ (function () {
    function InvoiceComponent(http, errorService, modalService, userService, paginationService) {
        this.http = http;
        this.errorService = errorService;
        this.modalService = modalService;
        this.userService = userService;
        this.paginationService = paginationService;
        this.listInvoice = [];
        this.descriptionMail = [];
        this.isLoading = false;
        this.isSuccess = false;
        this.sortAndPagination = [];
        this.host = environment_1.environment.host;
        this.isError = false;
    }
    InvoiceComponent.prototype.ngOnInit = function () {
        this.errorService.clearAlerts();
        this.objUser = JSON.parse(localStorage.getItem('currentUser'));
        //    this.getListMailStorage(null);
        this.getListViewOurPlans();
    };
    InvoiceComponent.prototype.openMailStorageModal = function (content, fs_obj) {
        this.descriptionMail = fs_obj;
        this.modalRef = this.modalService.open(content, { size: "lg" });
    };
    InvoiceComponent.prototype.applySort = function (sortFieldName, sortsDir) {
        if (sortFieldName == this.paginationService.sortField) {
            if (sortsDir == 'DESC') {
                this.paginationService.sortDir = 'ASC';
                this.paginationService.sortIcons = false;
            }
            else {
                this.paginationService.sortDir = 'DESC';
                this.paginationService.sortIcons = true;
            }
        }
        this.paginationService.sortField = sortFieldName;
        this.getListInvoice(null);
    };
    InvoiceComponent.prototype.getListInvoice = function (event) {
        var _this = this;
        var objRequest = {
            u_token: this.objUser.user.u_token,
            limit: event ? event.pageSize : this.paginationService.pageSize,
            page: event ? event.pageNo : this.paginationService.pageNo,
            search: this.paginationService.searchQuery,
            orderby: this.paginationService.sortField,
            direction: this.paginationService.sortDir,
        };
        setTimeout(function () { return _this.errorService.clearAlerts(); }, 3000);
        this.http.get(this.host + '/api/invoice/subscription/list/customer', { params: objRequest })
            .subscribe(function (response) {
            if (response.success) {
                console.log(response);
                _this.listInvoice = response.list.data;
                _this.sortAndPagination = response.list;
                _this.paginationService.setParamsForResponce(_this.sortAndPagination);
            }
        }, function (errResponse) {
            if (errResponse.error != undefined) {
                _this.isError = errResponse.error.error;
                _this.errorMessage = errResponse.error.message;
            }
        });
    };
    InvoiceComponent.prototype.getListSubscriptionCustomerPlans = function () {
        var _this = this;
        setTimeout(function () { return _this.errorService.clearAlerts(); }, 3000);
        var objRequest = {
            u_token: this.objUser.user.u_token
        };
        this.http.get(this.host + '/api/subscription/list/customer', { params: objRequest })
            .subscribe(function (response) {
            if (response.success) {
                //            console.log(response.list.length);
                if (response.list.length == 0) {
                    _this.subPTocken = '';
                }
                else {
                    _this.subPTocken = response.list[0].p_token;
                }
            }
        }, function (errResponse) {
            if (errResponse.error != undefined) {
                _this.isError = errResponse.error.error;
                _this.errorMessage = errResponse.error.message;
            }
        });
    };
    InvoiceComponent.prototype.clearMessages = function () {
        this.isModalError = this.isError = this.isModalError = this.isSuccess = false;
        this.successMessage = this.errorMessage = this.errorModalMessage = '';
    };
    InvoiceComponent.prototype.closeModal = function () {
        this.modalRef.close();
    };
    InvoiceComponent = __decorate([
        core_1.Component({
            selector: 'app-invoice',
            templateUrl: './invoice.component.html',
            styleUrls: ['./invoice.component.css']
        }),
        __metadata("design:paramtypes", [http_1.HttpClient,
            error_service_1.ErrorService,
            ng_bootstrap_1.NgbModal,
            user_service_1.UserService,
            pagination_service_1.PaginationService])
    ], InvoiceComponent);
    return InvoiceComponent;
}());
exports.InvoiceComponent = InvoiceComponent;
//# sourceMappingURL=invoice.component.js.map