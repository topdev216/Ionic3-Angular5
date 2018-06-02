import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddVideogamePage } from './add-videogame';

@NgModule({
  declarations: [
    AddVideogamePage,
  ],
  imports: [
    IonicPageModule.forChild(AddVideogamePage),
  ],
})
export class AddVideogamePageModule {}
