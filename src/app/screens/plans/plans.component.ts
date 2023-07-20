import { DateTime } from 'luxon';
import { Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from "@angular/material/tabs";
import { MatSidenav } from "@angular/material/sidenav";
import { ActivatedRoute, Router } from "@angular/router";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { ApiService } from "../../core/services/api.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import SweetAlert from 'sweetalert2';
import { StorageService } from 'src/app/core/storage/storage.service';
import { environment } from 'src/app/environments/environment';

declare let Razorpay: any;

@Component({
  selector: 'scp-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
})
export class PlansComponent implements OnInit {
  @ViewChild('planDetailsPanel') planDetailsPanel: MatSidenav | undefined;
  isAll = true;
  plans: any[] = [];
  planDetails: any;
  
  planServiceDetails: any;
  vehicleTypes: any[] = [];
  plansToggle = [{ name: 'Description', isSelect: true }, { name: 'About Client', isSelect: false }];
  selectedVehicleType: string | undefined;
  currentLocation = { lat: 0, lng: 0 };
  customerId: number = 0;
  customer: any;
  isSubscribedCustomer = false;
  clientId: number | undefined;
  sellerId: number | undefined;
  customerMobileNo: any;
  isCustomerLogged: boolean = false;
  isAccessDenied: boolean = false;
  loader = true;

  constructor(
    private readonly router: Router,
    private readonly apiService: ApiService,
    private readonly storageService: StorageService,
    private readonly matDialog: MatDialog,
    private readonly matBottomSheet: MatBottomSheet,
    private readonly activatedRoute: ActivatedRoute
  ) {

    this.activatedRoute.params.subscribe(params => {
      this.sellerId = Number(params['seller']);
      this.getClientId(params['uuid']);
      // this.customerMobileNo = params['cx'];
    });
    this.customerId = this.storageService.getCookie('masterCx');
    if (this.customerId == 0) {
      this.storageService.eraseCookie('customerToken');
    } else {
      this.apiService.getCustomerDetails(this.customerId).subscribe((res: any) => {
        this.customer = res;
        this.customerMobileNo = res.mobileNo;
        this.isSubscribedCustomer = res.isSubscribedCustomer;
      });

    }
    this.isCustomerLogged = !!this.storageService.getCookie('customerToken');

    const options = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(async position => {
      this.currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
    }, null, options);
    this.vehicleTypes = [
      { name: '2W', isSelect: false },
      { name: '3W', isSelect: false },
      { name: '4W', isSelect: false },
    ]
  }

  ngOnInit(): void {
  }

  getClientId(uuid: string) {
    this.loader = true;
    this.apiService.getClientDetails({ uuid }).subscribe((res: any) => {
      this.clientId = res[0]['id'];
      const payload = {
        sellerId: this.sellerId,
        clientId: this.clientId
      }
      this.apiService.checkAccess(payload).subscribe((res: any) => {
        this.loader = false;
        this.isAccessDenied = res.success;
        if (res.success) {
          this.getPlans();
        }
      });
    });
  }

  checkCustomer(mobileNo: string) {
    this.apiService.subscribedCustomerCheck(
      { mobileNo, clientId: this.clientId }
    ).subscribe((res: any) => {
      if (res.success) {
        this.customer = res.data;
        this.customerId = res.data.customerId;
        this.isSubscribedCustomer = res.data.isSubscribedCustomer;
      }
    });
  }

  getPlans() {
    const payload = {
      clientId: this.clientId,
      sellerId: this.sellerId
    }
    if (!this.isAll) {
      Object.assign(payload, { vehicleType: this.selectedVehicleType })
    }
    this.apiService.getSubscriptionPlans(payload).subscribe((res: any) => {
      if (res.success) {
        this.plans = res.data;
      }
    })
  }

  selectAll() {
    this.isAll = true;
    for (const v of this.vehicleTypes) {
      Object.assign(v, { isSelect: false });
    }
    this.getPlans();
  }

  openPlanDetails(plan: any) {
    this.planDetailsPanel?.open().then();
    this.apiService.getSubscriptionPlanDetails({
      id: plan['id'], client: this.clientId
    }).subscribe((res: any) => {
      if (res.success) {
        this.planDetails = res.data.subscriptionPlan;
        this.planServiceDetails = res.data.serviceDetails;
      }
    });
  }

  selectToggle(i: number) {
    for (const t of this.plansToggle) {
      Object.assign(t, { isSelect: false });
    }
    this.plansToggle[i]['isSelect'] = true;
  }

  goToMySubscription() {
    // const customerId = this.customerId + 7397098;
    this.router.navigate([`my-subscriptions`]).then();
  }

  selectVehicleType(data: any, i: number) {
    this.isAll = false;
    for (const v of this.vehicleTypes) {
      Object.assign(v, { isSelect: false });
    }
    this.vehicleTypes[i]['isSelect'] = true;
    this.selectedVehicleType = this.vehicleTypes[i]['name'];
    this.getPlans();
  }

  onTabChanged(ev: MatTabChangeEvent) {
    //
  }

  openPurchaseSheet(plan: any) {
    if (this.isCustomerLogged) {
      this.matBottomSheet.open(CustomerBuyPlanComponent, {
        // disableClose: true,
        autoFocus: false,
        panelClass: 'bottomSheet',
        data: {
          customerId: this.customerId,
          plan,
          points: this.currentLocation,
          customer: this.customer,
          mobileNumber: this.customerMobileNo,
          sellerId: this.sellerId
        }
      });
    } else {
      this.matDialog.open(CustomerLoginComponent, {
        disableClose: true,
        autoFocus: false,
        width: '100%'
      }).afterClosed().subscribe((customerData: any) => {
        if (customerData['isVerifiedCustomer']) {
          this.customer = customerData;
          this.customerId = customerData.customerId;
          this.isSubscribedCustomer = customerData.isSubscribed;
          this.isCustomerLogged = customerData['isVerifiedCustomer'];
          this.openPurchaseSheet(plan);
        }
      });

    }
  }
  opendialog() {
    this.matDialog.open(PaymentConfirmationDialogComponent, {
      disableClose: true,
      autoFocus: false,
      minWidth: '100%',
    });
  }
}


@Component({
  selector: 'scp-customer-tag-vehicle',
  templateUrl: './additional-screens/add-vehicle.html',
  styleUrls: ['./plans.component.scss'],
})
export class CustomerAddVehicleComponent {

  vehicleForm: FormGroup;
  vehicleTypes = [{ name: 'BIKE', isSelect: false }, { name: 'CAR', isSelect: false }];
  isNew = false;
  selectedVehicleType: string;
  filteredVehicles: any[] = [];
  vehicleId = 0;
  errMsg: string | undefined;


  constructor(
    private readonly matDialogRef: MatDialogRef<CustomerAddVehicleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: FormBuilder,
    private readonly matSnackBar: MatSnackBar,
    private readonly apiService: ApiService
  ) {
    this.vehicleForm = this.formBuilder.group({
      regNo: ['', Validators.required],
      vehicle: ['', Validators.required]
    });
    this.vehicleForm.get('vehicle')?.disable();
    this.vehicleTypes.filter((x: any) => x['name'] === this.data.type.toUpperCase())[0]['isSelect'] = true;
    this.selectedVehicleType = this.vehicleTypes.filter((x: any) => x['name'] === this.data.type.toUpperCase())[0]['name'];
  }

  selectNewVehicle(ev: MatCheckboxChange) {
    this.isNew = ev.checked;
    this.vehicleForm.patchValue({ refNo: '' });
  }

  chooseType(i: number) {
    for (const v of this.vehicleTypes) {
      Object.assign(v, { isSelect: false });
    }
    this.vehicleTypes[i]['isSelect'] = true;
    this.selectedVehicleType = this.vehicleTypes[i]['name'];
    this.filteredVehicles = [];
  }

  checkRegNumberExist() {
    if (this.vehicleForm.get('regNo')?.value) {
      this.errMsg = '';
      this.apiService.checkRegistrationNumber(this.vehicleForm.get('regNo')?.value).subscribe((res: any) => {
        if (res.success) {
          this.vehicleForm.patchValue({ vehicle: res.data.vehicleName });
          this.vehicleId = res.data.vehicleId;
        } else {
          this.vehicleId = 0;
          this.vehicleForm.patchValue({ vehicle: '' });
          this.vehicleForm.get('vehicle')?.enable();
        }
      });
    } else {
      this.errMsg = 'Please Enter Registration Number.'
    }
  }

  getVehicleId(data: any) {
    this.vehicleId = data['modelId'];
  }

  searchVehicles(ev: any) {
    if (ev.target.value.length > 1) {
      const payload = {
        name: ev.target.value,
        vehicleType: this.selectedVehicleType
      }
      this.apiService.searchVehicle(payload).subscribe((res: any) => {
        if (res.success) {
          this.filteredVehicles = res.data;
        }
      });
    }
  }

  addVehicle() {
    if (this.vehicleId > 0) {
      const payload = {
        clientId: this.data.clientId,
        customerId: this.data.customerId,
        registrationNumber: !this.isNew ? this.vehicleForm.get('regNo')?.value : 'NEW',
        vehicleMaster: this.vehicleId,
        chassisNumber: this.isNew ? this.vehicleForm.get('regNo')?.value : null
      }
      this.apiService.addVehicle(payload).subscribe((res: any) => {
        if (res.success) {
          this.matDialogRef.close('OK');
        } else {
          this.matSnackBar.open(res.message, 'OK', { duration: 3000 });
        }
      });
    }
  }

  close() {
    this.matDialogRef.close();
  }
}

@Component({
  selector: 'scp-customer-login',
  templateUrl: './additional-screens/customer-login.html',
  styleUrls: ['./plans.component.scss'],
})

export class CustomerLoginComponent {
  customerLoginForm: FormGroup;
  loginBtnPlaceholder = 'send OTP';
  sendOtpSuccess: boolean = false;


  constructor(
    private readonly apiService: ApiService,
    private readonly fb: FormBuilder,
    private snackBar: MatSnackBar,
    public readonly storageService: StorageService,
    private readonly matDialogRef: MatDialogRef<CustomerLoginComponent>,
  ) {
    this.customerLoginForm = this.fb.group({
      mobileNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      otp: ['', [Validators.required, Validators.minLength(4)]]
    });
    this.customerLoginForm.controls['otp'].disable();
  }

  sendAndVerify() {
    if (!this.sendOtpSuccess) {
      const mobileNo = this.customerLoginForm.get('mobileNo')?.value;
      if (mobileNo.length === 10) {
        this.apiService.customerSendOtp({ mobileNo: mobileNo }).subscribe((res: any) => {
          if (res.success) {
            this.customerLoginForm.controls['mobileNo'].disable();
            this.customerLoginForm.controls['otp'].enable();
            this.loginBtnPlaceholder = 'verify';
            this.sendOtpSuccess = true;
            this.snackBar.open('Otp send successfully', 'OK', { duration: 3600, panelClass: 'snack' });
          }
        });
      }
    } else {
      const payload = {
        mobileNo: this.customerLoginForm.get('mobileNo')?.value,
        otp: this.customerLoginForm.get('otp')?.value
      }
      this.apiService.customerVerifyOtp(payload).subscribe((res: any) => {
        if (res.success) {
          this.snackBar.open('Otp verified successfully', 'OK', { duration: 3600, panelClass: 'snack' });
          this.storageService.setCookie('customerToken', res.data.token, 1);
          this.storageService.setCookie('masterCx', res.data.customerId, 1);
          this.matDialogRef.close({
            customerId: res.data.customerId,
            customerName: res.data.customerName,
            customerEmail: res.data.customerEmailId,
            isSubscribed: res.data.isSubscribed,
            isVerifiedCustomer: true
          });

        }
      });
    }
  }

  editMobileNo() {
    this.customerLoginForm.reset();
    this.sendOtpSuccess = false;
    this.customerLoginForm.controls['mobileNo'].enable();
    this.customerLoginForm.controls['otp'].disable();
    this.loginBtnPlaceholder = 'send OTP';
  }

  closeLoginDialog() {
    this.matDialogRef.close(
      {
        isVerifiedCustomer: false
      }
    );
  }
}


@Component({
  selector: 'scp-customer-buy-plan',
  templateUrl: './additional-screens/buy-plan.html',
  styleUrls: ['./plans.component.scss'],
})
export class CustomerBuyPlanComponent {
  colorCodes = [
    { primary: '#f4f4f5' },
    { primary: '#ecfccb' },
    { primary: '#ffedd5' },
    { primary: '#cffafe' },
    { primary: '#fee2e2' },
    { primary: '#ccfbf1' },
    { primary: '#fef9c3' },
    { primary: '#dcfce7' },
    { primary: '#f3e8ff' },
    { primary: '#dbeafe' },
    { primary: '#fae8ff' },
    { primary: '#fce7f3' },
    { primary: '#f4f4f5' },
    { primary: '#ecfccb' },
    { primary: '#ffedd5' },
    { primary: '#cffafe' },
    { primary: '#fee2e2' },
    { primary: '#ccfbf1' },
    { primary: '#fef9c3' },
    { primary: '#dcfce7' },
    { primary: '#f3e8ff' },
    { primary: '#f4f4f5' },
    { primary: '#ecfccb' },
    { primary: '#ffedd5' },
    { primary: '#cffafe' },
    { primary: '#fee2e2' },
    { primary: '#ccfbf1' },
    { primary: '#fef9c3' },
    { primary: '#dcfce7' },
    { primary: '#f3e8ff' },
    { primary: '#f4f4f5' },
    { primary: '#ecfccb' },
    { primary: '#ffedd5' },
    { primary: '#cffafe' },
    { primary: '#fee2e2' },
    { primary: '#ccfbf1' },
    { primary: '#fef9c3' },
    { primary: '#dcfce7' },
    { primary: '#f3e8ff' },
    { primary: '#f4f4f5' },
    { primary: '#ecfccb' },
    { primary: '#ffedd5' },
    { primary: '#cffafe' },
    { primary: '#fee2e2' },
    { primary: '#ccfbf1' },
    { primary: '#fef9c3' },
    { primary: '#dcfce7' },
    { primary: '#f3e8ff' },
  ];
  veh = [{}, {}, {}, {}];
  myVehicles: any[] = [];
  selectedVehicle: any;
  isPaymentFailed: boolean | undefined;
  isLoading = true;
  myBikes: any[] = [];
  myCars: any[] = [];

  constructor(
    private readonly matBottomSheetRef: MatBottomSheetRef<CustomerBuyPlanComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private readonly matDialog: MatDialog,
    private zone: NgZone,
    private readonly apiService: ApiService
  ) {
    this.getCustomerVehicles();
  }

  getCustomerVehicles() {
    this.isLoading = true;
    this.apiService.getVehicles({ customerId: this.data.customerId }).subscribe((res: any) => {
      if (res.success) {
        this.isLoading = false;
        this.myBikes = res.data.filter((v: any) => v['vehicleType'] === 'BIKE');
        this.myCars = res.data.filter((v: any) => v['vehicleType'] === 'CAR');

        this.myVehicles = this.data.plan.vehicleType === "BIKE" ? this.myBikes : this.myCars;
        for (const v of this.myVehicles) {
          Object.assign(v, { isSelect: false });
        }
      }
    });
  }


  chooseVehicle(i: number) {
    for (const v of this.myVehicles) {
      Object.assign(v, { isSelect: false });
    }
    this.myVehicles[i]['isSelect'] = true;
    this.selectedVehicle = this.myVehicles[i];
  }

  unSelectVehicle() {
    for (const v of this.myVehicles) {
      Object.assign(v, { isSelect: false });
      this.selectedVehicle = null;
    }
  }

  openDialog() {
    this.unSelectVehicle();
    this.matDialog.open(CustomerAddVehicleComponent, {
      disableClose: true,
      autoFocus: false,
      minWidth: '100%',
      minHeight: '45vh',
      panelClass: 'dialog',
      data: {
        clientId: this.data.plan.client.id,
        customerId: this.data.customerId,
        type: this.data.plan.subscriptionPlan.vehicleType
      }
    }).afterClosed().subscribe((e: string) => {
      if (e === 'OK') {
        this.getCustomerVehicles();
      }
    });
  }

  purchase() {
    const payload = {
      amount: this.data.plan.subscriptionPlan.sellingPrice,
      note: 'subscription purchase',
      subscriptionPlanId: this.data.plan.subscriptionPlan.id,
      vehicleId: this.selectedVehicle['vehicleMasterId'],
      customerId: this.data.customerId,
      paymentVendor: "RAZORPAY",
      clientId: this.data.plan.client.id,
      lat: this.data.points.lat,
      lng: this.data.points.lng,
      paymentDate: new Date(),
      source: 'B2B Web',
      registeredVehicle: this.selectedVehicle.registerdVehicleId,
      sellerId: this.data.sellerId,
    }
    this.apiService.planPurchaseRequest(payload).subscribe((res: any) => {
      if (res.success) {
        this.callSubscriptionRazorPay(res.data).then();
      }
    });
  }

  async callSubscriptionRazorPay(id: any) {
    const options = {
      key: environment.razorPayKey,
      // amount: this.data.plan.subscriptionPlan.sellingPrice * 100,
      currency: 'INR',
      name: this.data.plan.subscriptionPlan.name,
      description: '',
      image: 'https://readyassist.in/assets/images/home/logo.png',
      order_id: id,
      handler: (result: any) => {
        this.zone.run(() => {
          this.closePanel().then();
          this.openSuccessDialog();
        });
      },
      prefill: {
        name: this.data.customer.customerName,
        contact: this.data.mobileNumber,
        readOnly: false
      },
      theme: {
        color: '#35446F',
      },
    };
    const razorpay = new Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      this.isPaymentFailed = true;
      //payment failed
      this.paymentFailed();
    });
    razorpay.open();
  }
  async closePanel() {
    this.matBottomSheetRef.dismiss();
  }

  paymentFailed() {
    SweetAlert.fire({
      title: 'OOPS!',
      text: 'Payment Failed.',
      allowOutsideClick: false,
      icon: 'warning',
      showCancelButton: false,
      // confirmButtonText: 'Try Again'
      confirmButtonText: 'Okay, Understood'
    }).then((e: any) => {
      if (e.isConfirmed) {
        //
      }
    });
  }

  openSuccessDialog() {
    this.matDialog.open(PaymentConfirmationDialogComponent, {
      disableClose: true,
      autoFocus: false,
      minWidth: '100%',
      panelClass: 'paymentSuccess',
      data: {
        plan: this.data.plan,
        tagedVehicle: this.selectedVehicle
      }
    }).afterClosed().subscribe((e: string) => {
      if (e === 'OK') {
        //
      }
    });
    this.unSelectVehicle();
  }

  // subscriptionStatusCheck(id: any) {
  //   this.apiService.subscriptionStatusCheck(id).subscribe((res: any) => {
  //     console.log(res);
  //   });
  // }

  closeSheet() {
    this.matBottomSheetRef.dismiss();
  }
}


@Component({
  selector: 'scp-customer-payment-confirmation',
  templateUrl: './additional-screens/confirmation-dialog.html',
  styleUrls: ['./plans.component.scss'],
})
export class PaymentConfirmationDialogComponent {
  plan: any;
  vehicleName: any;
  planValidity: any;
  startDate = new Date().toISOString();
  endDate: any;
  vehicleRegNo: any;
  constructor(
    private readonly matDialogRef: MatDialogRef<PaymentConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: FormBuilder,
    private readonly matSnackBar: MatSnackBar,
    private readonly apiService: ApiService
  ) {

  }

  ngOnInit(): void {
    this.plan = this.data.plan.name;
    this.vehicleName = this.data.tagedVehicle.vehicleName;
    this.planValidity = this.data.plan.validity;
    this.vehicleRegNo = this.data.tagedVehicle.registrationNumber;
    this.endDate = DateTime.now().plus({ days: this.planValidity }).toJSDate().toISOString();
  }

  close() {
    this.matDialogRef.close();
  }
}
