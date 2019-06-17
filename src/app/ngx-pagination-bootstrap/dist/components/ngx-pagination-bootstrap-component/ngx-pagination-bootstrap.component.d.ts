import { OnInit, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
export declare class PaginationComponent implements OnInit, OnChanges {
    pageSize: number;
    itemsCount: number;
    data: any;
    position: string;
    getPageData: EventEmitter<any>;
    currentPage: number;
    totalPages: any;
    pages: any;
    itemsRange: {
        from: number;
        to: number;
    };
    private nullAble;
    constructor();
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    calculatePageNumbers(): void;
    navigateToPage(pageNo: number): void;
    changePageData($event: any): void;
    getPageItems($event: any): void;
    getCurrentPageData(): any;
    getNextPagesArrayToDisplay(): void;
    changePageSize(): void;
    nextPage(): void;
    previousPage(): void;
    calculateCurrentItemsRange(): void;
}
