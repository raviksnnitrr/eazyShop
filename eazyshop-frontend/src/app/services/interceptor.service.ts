import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { from,Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor{

  constructor(private oktaAuth: OktaAuth) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req,next));
  }
  private async handleAccess(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const securedEndpoints=[environment.eazyshopApiUrl+'/order'];
    if(securedEndpoints.some(url=>req.urlWithParams.includes(url))){
      const accessToken=await this.oktaAuth.getAccessToken();
      req=req.clone({
        setHeaders: {
          Authorization: 'Bearer '+accessToken
        }
      });
    }
    return next.handle(req).toPromise();
  }
  
  
}
