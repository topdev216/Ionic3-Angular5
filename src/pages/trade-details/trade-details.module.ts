import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TradeDetailsPage } from './trade-details';

@NgModule({
  declarations: [
    TradeDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(TradeDetailsPage),
  ],
})
export class TradeDetailsPageModule {}
