import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShippingAddressFormPage } from './shipping-address-form';

@NgModule({
  declarations: [
    ShippingAddressFormPage,
  ],
  imports: [
    IonicPageModule.forChild(ShippingAddressFormPage),
  ],
})
export class ShippingAddressFormPageModule {}
