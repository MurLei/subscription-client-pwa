import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { ApiService } from "../../core/services/api.service";
import { ActivatedRoute } from "@angular/router";
import { DateTime } from "luxon";
import { Location } from "@angular/common";
import { StorageService } from '../../core/storage/storage.service';

@Component({
  selector: 'scp-customer-subscriptions',
  templateUrl: './customer-subscriptions.component.html',
  styleUrls: ['./customer-subscriptions.component.scss'],
})
export class CustomerSubscriptionsComponent {
  isOpen = false;
  plans = [
    { id: 1, name: 'Plan A', price: 200, desc: 'hello' },
    { id: 2, name: 'Plan A', price: 200, desc: 'hello' },
    { id: 2, name: 'Plan A', price: 200, desc: 'hello' },
    { id: 2, name: 'Plan A', price: 200, desc: 'hello' },
  ];
  subscriptions: any[] = [];
  customerId: number = 0;
  customer: any;

  constructor(
    private readonly matBottomSheet: MatBottomSheet,
    private readonly apiService: ApiService,
    private readonly activatedRoute: ActivatedRoute,
    private location: Location,
    public readonly storageService: StorageService,
  ) {
    const cx = this.storageService.getCookie('masterCx');
    this.customerId = cx;
      this.getCustomerSubscriptions(this.customerId);

      this.apiService.getCustomerDetails(this.customerId).subscribe((res: any) => {
        // if(res.success) {
          this.customer = res;
        // }
      });
    
    
    // this.activatedRoute.paramMap.subscribe(params => {
    //   this.customerId = Number(params.get('id'));
    //   this.getCustomerSubscriptions(this.customerId);
    // });
  }

  getColors(data: any) {
    for (const c of data) {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      Object.assign(c, { color: '#' + randomColor })
    }

  }

  goBack() {
    this.location.back();
  }

  getCustomerSubscriptions(id: number) {
    this.apiService.getCustomerSubscriptions(id).subscribe((res: any) => {
      if (res.success) {
        this.subscriptions = res.data;
        this.getColors(res.data);
        for (const s of this.subscriptions) {
          Object.assign(s, {
            isExpired: DateTime.fromISO(s['subscriptionExpiryDate']).toJSDate() < DateTime.now().toJSDate()
          });
        }
      }
    });
  }

  openSubscriptionDetail(s: any) {
    this.matBottomSheet.open(CustomerSubscriptionsDetailsComponent, {
      // disableClose: true,
      autoFocus: false,
      data: s,
      panelClass: 'bottomSheet',
      backdropClass: 'bottomBackdrop',
    });
  }
}


@Component({
  selector: 'scp-customer-subscriptions-details',
  templateUrl: './additional-screens/subscription-details.html',
  styleUrls: ['./customer-subscriptions.component.scss'],
})
export class CustomerSubscriptionsDetailsComponent {


  constructor(
    private readonly matBottomSheetRef: MatBottomSheetRef<CustomerSubscriptionsDetailsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {
    const expiryDate = DateTime.fromISO(data['subscriptionExpiryDate']);
    const daysLeft = expiryDate.diff(DateTime.now(), ["days"]);
    Object.assign(data, { daysLeft: Math.floor(Number(daysLeft.toObject().days)) });
  }


  closeSheet() {
    this.matBottomSheetRef.dismiss();
  }
}
