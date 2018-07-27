import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PickGamePage } from './pick-game';

@NgModule({
  declarations: [
    PickGamePage,
  ],
  imports: [
    IonicPageModule.forChild(PickGamePage),
  ],
})
export class PickGamePageModule {}
