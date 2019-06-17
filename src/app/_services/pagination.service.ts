import {Injectable, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {UserService} from '../_services/user.service';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  itemsCount = 0;
  pageNo = 1;
  pageSize = 10;
  searchQuery = '';
  sortField = 'created_at';
  sortDir = 'DESC';
  sortIcons = true;
  visiblePagination = true;


  constructor(public userService: UserService) {}

  setParamsForResponce(paramObj: any) {
    if (!paramObj.data.length) {
      this.visiblePagination = false;
    } else {
      this.visiblePagination = true;
    }
    this.itemsCount = paramObj.total;
    this.pageNo = paramObj.current_page;
  }

  applySort(sortFieldName: string, sortsDir: string, callback: any = null) {
    if (sortsDir == 'DESC') {
      this.sortDir = 'ASC';
      this.sortIcons = false;
    } else {
      this.sortDir = 'DESC';
      this.sortIcons = true;
    }
    this.sortField = sortFieldName;
    this.pageSize = this.pageSize;
    this.pageNo = this.pageNo;

    if (callback) {
      callback();
    }
  }

  getFilterFromLocalStorage( strStorageName: string = '' ) {
    return localStorage.getItem( strStorageName ) ? JSON.parse( localStorage.getItem( strStorageName ) ) : null;
  }

  setFilterInLocalStorage( strStorageName: string = '', value: any = {} ) {
    localStorage.setItem( strStorageName, JSON.stringify( value ) );
  }

  resetFilterInLocalStorage( strStorageName: string = '' ) {
    localStorage.removeItem(strStorageName);
  }

  generateFilterForLocalStorage( strStorageName: string = '', objFilter: any = {} ) {
    const objStorageFilter = <any> Object.assign( {}, { filter: objFilter } );
    objStorageFilter.pagination = {
      pageSize: this.pageSize,
      pageNo: this.pageNo,
      searchQuery: this.searchQuery,
      sortField: this.sortField,
      sortDir: this.sortDir
    };

    this.setFilterInLocalStorage( strStorageName, objStorageFilter );
  }
}
