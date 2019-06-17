import { Injectable } from '@angular/core';
import {ToasterService} from 'angular2-toaster';

@Injectable({
  providedIn: 'root'
})
export class TopAlertsService {

  private toasterService: ToasterService;
  
  constructor( toasterService: ToasterService ) {
    this.toasterService = toasterService;
  }
  
  popToast(type: string = 'info', title: string = '', message: string = '', bShowClose: boolean = true ) {
    this.toasterService.pop(type, title, message);
  }
}
