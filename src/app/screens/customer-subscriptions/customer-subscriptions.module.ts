import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CustomerSubscriptionsComponent,
  CustomerSubscriptionsDetailsComponent
} from "./customer-subscriptions.component";
import {customerSubscriptionsRouting} from "./customer-subscription.route";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";


@NgModule({
  declarations: [CustomerSubscriptionsComponent, CustomerSubscriptionsDetailsComponent],
  imports: [
    CommonModule,
    customerSubscriptionsRouting,
    MatExpansionModule,
    MatIconModule,
    MatBottomSheetModule
  ]
})
export class CustomerSubscriptionsModule {
}
