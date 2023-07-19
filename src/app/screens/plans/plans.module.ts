import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CustomerAddVehicleComponent,
  CustomerBuyPlanComponent, CustomerLoginComponent, PaymentConfirmationDialogComponent,
  PlansComponent
} from './plans.component';
import {plansRouting} from "./plans.route";
import {MatCardModule} from "@angular/material/card";
import {MatTabsModule} from "@angular/material/tabs";
import {MatButtonModule} from "@angular/material/button";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatIconModule} from "@angular/material/icon";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatRippleModule} from "@angular/material/core";
import {MatDialogModule} from "@angular/material/dialog";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatSnackBarModule} from "@angular/material/snack-bar";



@NgModule({
  declarations: [PlansComponent, CustomerBuyPlanComponent, CustomerAddVehicleComponent, PaymentConfirmationDialogComponent,CustomerLoginComponent],
  imports: [
    CommonModule,
    plansRouting,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatBottomSheetModule,
    MatRippleModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule
    
  ],
})
export class PlansModule {
}
