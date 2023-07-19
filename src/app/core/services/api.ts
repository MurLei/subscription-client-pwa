import {environment} from "./../../environments/environment";
// environments/environment
const baseUrl = environment.baseUrl;
export const apiPath = {
  vehicle: {
    search: baseUrl + 'customers/fetch-vehicle-make-model',
    add: baseUrl + 'customer-vehicle-mapping/add-vehicle/v1',
    existCheck: baseUrl + 'vehicle-registered/find/is-exist',
    vehicles: baseUrl + 'orders/vehicle-list',
  },
  subscription: {
    customer: baseUrl + 'customers',
    list: baseUrl + 'subscription-list/fetch-by/customer',
    customerCheck: baseUrl + 'customers/is-subscribed',
    plans: baseUrl + 'subscription/plans/fetch-plan/list',
    details: baseUrl + 'customers/fetch-subscription-details',
    purchaseRequest: baseUrl + 'subscription-list/purchase-cx-request',
    status: baseUrl + 'subscription-order-book/fetch-subscriptions',
  },
  client: {
    details: baseUrl + 'client',
  },
  customer: {
    sendOtp: baseUrl + 'customers/login/v2/fry/mobile/send__otp',
    verifyOtp: baseUrl + 'customers/verify-login-otp',
    detailsGetById: baseUrl + 'customers/fetch'
  },
  access: {
    check: baseUrl + 'client-pwa-access/validate-url'
  }

}
