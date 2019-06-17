import { Component, Input, EventEmitter, Output } from "@angular/core";
var PaginationComponent = /** @class */ (function () {
    function PaginationComponent() {
        this.data = null;
        this.position = "left";
        this.getPageData = new EventEmitter();
        this.currentPage = 1;
        this.totalPages = [];
        this.pages = [];
        this.itemsRange = {
            from: 1,
            to: 0
        };
        this.nullAble = null;
        this.pageSize = 10;
    }
    PaginationComponent.prototype.ngOnInit = function () {
        if (this.data != null) {
            this.itemsCount = this.data.length;
        }
        this.calculatePageNumbers();
        this.calculateCurrentItemsRange();
    };
    PaginationComponent.prototype.ngOnChanges = function (changes) {
        this.currentPage = 1;
        var $event = {
            event: changes,
            pageNo: this.currentPage,
            pageSize: this.pageSize,
            data: this.nullAble
        };
        this.calculatePageNumbers();
        this.changePageData($event);
    };
    PaginationComponent.prototype.calculatePageNumbers = function () {
        var pages = Math.ceil(this.itemsCount / this.pageSize);
        this.totalPages = [];
        for (var y = 0; y < pages; y++) {
            this.totalPages[y] = y + 1;
        }
        this.pages = this.totalPages.slice(0, 5);
    };
    PaginationComponent.prototype.navigateToPage = function (pageNo) {
        this.currentPage = pageNo;
        var $event = {
            event: window.event,
            pageNo: pageNo,
            pageSize: this.pageSize,
            data: this.nullAble
        };
        this.changePageData($event);
    };
    PaginationComponent.prototype.changePageData = function ($event) {
        this.getPageItems($event);
        this.getNextPagesArrayToDisplay();
        this.calculateCurrentItemsRange();
    };
    PaginationComponent.prototype.getPageItems = function ($event) {
        var thisPageData = null;
        if (this.data != null) {
            thisPageData = this.getCurrentPageData();
        }
        $event.data = thisPageData;
        this.getPageData.emit($event);
    };
    PaginationComponent.prototype.getCurrentPageData = function () {
        var start = (this.currentPage - 1) * this.pageSize;
        var end = start + Number(this.pageSize);
        return this.data.slice(start, end);
    };
    PaginationComponent.prototype.getNextPagesArrayToDisplay = function () {
        var startIndex = this.currentPage - 3 >= 0 ? this.currentPage - 3 : 0;
        var endIndex = this.currentPage + 2 < 5 ? 5 : this.currentPage + 2;
        if (endIndex > this.totalPages.length) {
            endIndex = this.totalPages.length;
            startIndex =
                this.totalPages.length - 5 < 0 ? 0 : this.totalPages.length - 5;
        }
        this.pages = this.totalPages.slice(startIndex, endIndex);
    };
    PaginationComponent.prototype.changePageSize = function () {
        this.calculatePageNumbers();
        this.currentPage = 1;
        var $event = {
            event: window.event,
            pageNo: 1,
            pageSize: this.pageSize,
            data: this.nullAble
        };
        this.changePageData($event);
    };
    PaginationComponent.prototype.nextPage = function () {
        this.navigateToPage(this.currentPage + 1);
    };
    PaginationComponent.prototype.previousPage = function () {
        this.navigateToPage(this.currentPage - 1);
    };
    PaginationComponent.prototype.calculateCurrentItemsRange = function () {
        if (this.itemsCount === 0) {
            this.itemsRange.to = 0;
            this.itemsRange.from = 0;
            return;
        }
        this.itemsRange.from = this.pageSize * this.currentPage - this.pageSize + 1;
        if (this.currentPage === this.pages[this.pages.length - 1]) {
            this.itemsRange.to = this.itemsCount;
            return;
        }
        this.itemsRange.to = this.pageSize * this.currentPage;
    };
    PaginationComponent.decorators = [
        { type: Component, args: [{
                    selector: "ng-pagination",
                    template: "\n    <nav aria-label=\"pagination\" class=\"p-1 d-flex\" [ngClass]=\"{'justify-content-center':position=='center','justify-content-end':position=='right'}\">\n      <select data-toggle=\"tooltip\" data-placement=\"top\" title=\"Items Per Page\" [(ngModel)]=\"pageSize\" class=\"form-control p-0\" style=\"width:50px\" (change)=\"changePageSize()\">\n        <option value=\"10\">10</option>\n        <option value=\"20\">20</option>\n        <option value=\"50\">50</option>\n <option value=\"100\">100</option>\n     </select>\n      <ul class=\"pagination\">\n        <li class=\"page-item\" [ngClass]=\"{'disabled':currentPage == 1}\">\n          <button [disabled]=\"currentPage == 1\" (click)=\"navigateToPage(1)\" class=\"page-link\" aria-label=\"first\">\n            <span aria-hidden=\"true\">First</span>\n            <span class=\"sr-only\">First</span>\n          </button>\n        </li>\n        <li class=\"page-item\">\n          <button [disabled]=\"currentPage == 1\" (click)=\"previousPage()\" class=\"page-link\" aria-label=\"Previous\">\n            <span aria-hidden=\"true\">&laquo;</span>\n            <span class=\"sr-only\">Previous</span>\n          </button>\n        </li>\n        <li [ngClass]=\"{'active':currentPage == page}\" class=\"page-item\" *ngFor=\"let page of pages\" (click)=\"navigateToPage(page)\">\n          <button class=\"page-link\">{{page}}</button>\n        </li>\n        <li class=\"page-item\">\n          <button [disabled]=\"currentPage == totalPages[totalPages.length -1]\" (click)=\"nextPage()\" class=\"page-link\" aria-label=\"Next\">\n            <span aria-hidden=\"true\">&raquo;</span>\n            <span class=\"sr-only\">Next</span>\n          </button>\n        </li>\n        <li class=\"page-item\" [ngClass]=\"{'disabled':currentPage == totalPages[totalPages.length -1]}\">\n          <button [disabled]=\"currentPage == totalPages[totalPages.length -1]\" (click)=\"navigateToPage(totalPages[totalPages.length -1])\"\n            class=\"page-link\" aria-label=\"last\">\n            <span aria-hidden=\"true\">Last</span>\n            <span class=\"sr-only\">Last</span>\n          </button>\n        </li>\n        <li class=\"page-item d-none d-md-block\">\n          <button disabled class=\"page-link\" aria-label=\"count\">\n            <span>{{itemsRange.from}} - {{itemsRange.to}} of {{itemsCount}}</span>\n          </button>\n        </li>\n      </ul>\n    </nav>\n  ",
                    styles: ["\n\n  "]
                },] },
    ];
    /** @nocollapse */
    PaginationComponent.ctorParameters = function () { return []; };
    PaginationComponent.propDecorators = {
        'pageSize': [{ type: Input },],
        'itemsCount': [{ type: Input },],
        'data': [{ type: Input },],
        'position': [{ type: Input },],
        'getPageData': [{ type: Output },],
    };
    return PaginationComponent;
}());
export { PaginationComponent };
//# sourceMappingURL=ngx-pagination-bootstrap.component.js.map