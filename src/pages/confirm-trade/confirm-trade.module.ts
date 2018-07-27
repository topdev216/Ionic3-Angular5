import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfirmTradePage } from './confirm-trade';

@NgModule({
  declarations: [
    ConfirmTradePage,
  ],
  imports: [
    IonicPageModule.forChild(ConfirmTradePage),
  ],
})
export class ConfirmTradePageModule {}
