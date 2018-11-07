import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GameInformationPage } from './game-information';

@NgModule({
  declarations: [
    GameInformationPage,
  ],
  imports: [
    IonicPageModule.forChild(GameInformationPage),
  ],
})
export class GameInformationPageModule {}
