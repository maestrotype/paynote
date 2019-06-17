import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../environments/environment';
import {MessagesService} from '../../_services/messages.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {

  public host: string;

  constructor(private http: HttpClient, private router: ActivatedRoute, public messages: MessagesService) {
    this.host = environment.host;
  }

  ngOnInit() {
    const token = this.router.snapshot.paramMap.get('confirm_token');
    this.confirmEmail(token)
  }

  confirmEmail(token: string) {
    let objRequest: any = {
      token: token
    };
    this.http.post<any>(this.host + '/user/email/confirmation', objRequest)
      .subscribe(
        response => {
          if (response.success) {
            localStorage.setItem('currentUser', JSON.stringify(response))
          }
        },
        errResponse => {
          if (errResponse.error) {

          }
        }
      );
  }

}
