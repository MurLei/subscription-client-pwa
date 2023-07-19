import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: ':seller/:uuid',
    loadChildren: () => import('./screens/plans/plans.module').then(m => m.PlansModule)
  },
  {
    path: 'my-subscriptions',
    loadChildren: () => import('./screens/customer-subscriptions/customer-subscriptions.module').then(m => m.CustomerSubscriptionsModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledNonBlocking',
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
