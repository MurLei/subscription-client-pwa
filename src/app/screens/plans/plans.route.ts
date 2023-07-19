import { ModuleWithProviders } from '@angular/core';
import {Routes, RouterModule, Route} from '@angular/router';
import {PlansComponent} from "./plans.component";

const plansRoutes: Routes = [{ path: '', component: PlansComponent }];
export const plansRouting: ModuleWithProviders<Route> = RouterModule.forChild(plansRoutes);
