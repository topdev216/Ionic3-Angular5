import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlatformSelectionPage } from './platform-selection';

@NgModule({
  declarations: [
    PlatformSelectionPage,
  ],
  imports: [
    IonicPageModule.forChild(PlatformSelectionPage),
  ],
})
export class PlatformSelectionPageModule {}
