import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreditFormPage } from './credit-form';

@NgModule({
  declarations: [
    CreditFormPage,
  ],
  imports: [
    IonicPageModule.forChild(CreditFormPage),
  ],
})
export class CreditFormPageModule {}
