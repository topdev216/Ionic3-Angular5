import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddUsernamePage } from './add-username';

@NgModule({
  declarations: [
    AddUsernamePage,
  ],
  imports: [
    IonicPageModule.forChild(AddUsernamePage),
  ],
})
export class AddUsernamePageModule {}
