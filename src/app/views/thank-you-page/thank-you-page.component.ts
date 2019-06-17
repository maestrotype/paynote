import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-thank-you-page',
  templateUrl: './thank-you-page.component.html',
  styleUrls: ['./thank-you-page.component.css']
})
export class ThankYouPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  
  getMessage() {
//    setTimeout(function () {
//      localStorage.setItem('thankyou_page_message', '');
//    }, '5000');
    
    return localStorage.getItem('thankyou_page_message');
  }

}
