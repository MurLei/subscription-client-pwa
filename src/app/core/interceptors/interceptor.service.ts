import {Inject, Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {finalize, Observable, tap} from 'rxjs';
import {StorageService} from '../storage/storage.service';
import {Router} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {NgxUiLoaderService} from "ngx-ui-loader";

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {

  constructor(
    private readonly storageService: StorageService,
    private readonly router: Router,
    private ngxService: NgxUiLoaderService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.storageService.getCookie('customerToken')) {
      req = req.clone({setHeaders: {Authorization: 'Bearer ' + this.storageService.getCookie('customerToken')}});
    }
    return next.handle(req).pipe(
      finalize(() => {
        // this.loaderService.isLoading.next(false);
        // this.ngxService.stop();
      }),
      tap(() => {
        },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.storageService.eraseCookie('customerToken');
            }
          }
        }));
  }
}
