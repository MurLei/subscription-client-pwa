import { ModuleWithProviders } from '@angular/core';
import {Routes, RouterModule, Route} from '@angular/router';
import {CustomerSubscriptionsComponent} from "./customer-subscriptions.component";

const customerSubscriptionsRoutes: Routes = [{ path: '', component: CustomerSubscriptionsComponent }];
export const customerSubscriptionsRouting: ModuleWithProviders<Route> = RouterModule.forChild(customerSubscriptionsRoutes);
