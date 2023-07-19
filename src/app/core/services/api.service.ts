import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {apiPath} from "./api";


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
  ) {
  }

  searchVehicle(payload: any): Observable<any> {
    return this.http.get(apiPath.vehicle.search, {
      params: {
        type: payload.vehicleType,
        mode: 'vehicleName',
        searchQuery: payload.name
      }
    });
  }
  getCustomer(payload: any): Observable<any> {
    return this.http.get(apiPath.subscription.customer, {params: payload});
  }

  getCustomerSubscriptions(id: any): Observable<any> {
    return this.http.get(`${apiPath.subscription.list}/${id}`);
  }

  subscribedCustomerCheck(payload: any): Observable<any> {
    return this.http.post(apiPath.subscription.customerCheck, payload);
  }


  getVehicles(payload: any): Observable<any> {
    return this.http.post(apiPath.vehicle.vehicles, payload);
  }

  checkRegistrationNumber(registrationNumber: string): Observable<any> {
    return this.http.get(apiPath.vehicle.existCheck, {params: {registrationNumber}});
  }

  addVehicle(payload: any): Observable<any> {
    return this.http.post(apiPath.vehicle.add, payload);
  }
  getSubscriptionPlans(payload: any): Observable<any> {
    return this.http.get(apiPath.subscription.plans, {params: payload});
  }
  getSubscriptionPlanDetails(payload: any): Observable<any> {
    return this.http.get(apiPath.subscription.details, {params: payload});
  }
  planPurchaseRequest(payload: any): Observable<any> {
    return this.http.post(apiPath.subscription.purchaseRequest, payload);
  }
  subscriptionStatusCheck(id: any): Observable<any> {
    return this.http.get(`${apiPath.subscription.status}/${id}`);
  }
  getClientDetails(uuid:any):Observable<any> {    
    return this.http.get(apiPath.client.details, {params: uuid});
  }

  customerSendOtp(data: any): Observable<any> {
    return this.http.post<any>(apiPath.customer.sendOtp, data);
  }
  customerVerifyOtp(data: any): Observable<any> {
    return this.http.post<any>(apiPath.customer.verifyOtp, data);
  }
  getCustomerDetails(id: any):Observable<any> {
    return this.http.get(`${apiPath.customer.detailsGetById}/${id}`);
  }
  checkAccess(payload: any): Observable<any> {
    return this.http.get<any>(apiPath.access.check, {params: payload});
  }
  
}
