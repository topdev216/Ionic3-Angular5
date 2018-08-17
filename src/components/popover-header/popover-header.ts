import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';

/**
 * Generated class for the PopoverHeaderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'popover-header',
  templateUrl: 'popover-header.html'
})
export class PopoverHeaderComponent {

  text: string;

  constructor(public viewCtrl: ViewController, public dataService: DataService) {
    console.log('Hello PopoverHeaderComponent Component');
    this.text = 'Hello World';
  }

  private logout(): void{
    this.dataService.signOut().then(()=>{
      this.viewCtrl.dismiss();
    });
  }

}
