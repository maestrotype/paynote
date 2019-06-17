import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor( private router: Router ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler): Observable<HttpEvent<any>> {

    const currentUser = <any> JSON.parse(localStorage.getItem('currentUser'));
    const headers = <any> {
      'Content-Type': 'application/json; charset=utf-8'
    };

    if (localStorage.getItem('ipClient')) {
      headers['Remote-IP'] = localStorage.getItem('ipClient');
      headers['X-Remote-IP'] = localStorage.getItem('ipClient');
    }
    if (currentUser && currentUser.token) {
      headers['Authorization'] = 'Bearer ' + currentUser.token;

      request = request.clone({
        setHeaders: headers
      });
    } else {
      request = request.clone({
        setHeaders: headers
      });
    }

    return next.handle(request).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
//        if (err.statusText == 'Unauthorized' || err.status == 401 ) {
//          this.router.navigate( ['/login'] );
//        }
        if (err.error.error &&
              ( err.error.message == 'Token has expired' || err.error.message == 'access_denied'
              || err.error.error == 'token_not_provided' || err.error.error == 'token_expired'
              || err.error.error == 'token_invalid' || err.error.error == 'user_not_found' )) {
          this.router.navigate( ['/login'] );
        }
      }
      });
//      .finally(() =>
//        document.querySelector('#animationload').setAttribute('style', 'display:none'
//      ) );
  }
}
