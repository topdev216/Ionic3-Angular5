import { Component,Input,ViewChild } from '@angular/core';
import { AlertController,NavController,NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { MessagingPage } from '../../pages/messaging/messaging';

/**
 * Generated class for the MenuComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'menu',
  templateUrl: 'menu.html'
})
export class MenuComponent {

  text: string;
  @Input()
  username:string;

  @ViewChild('mycontent') 
  navCtrl: NavController;
  @ViewChild('mycontent') 
  navParams: NavParams;


  constructor(public dataService: DataService,public alertCtrl: AlertController) {
    console.log('Hello MenuComponent Component');
    this.text = 'Hello World';
  }

  private createPublic() :void{
    let alert = this.alertCtrl.create({
      title: 'Public Chatroom',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: data => {
            this.dataService.createPublicChatroom(data.name).then(()=>{
                this.navParams.data('title',data.name)
              })
            }
          }
      ]
    })

    alert.present();

    alert.onDidDismiss(()=>{
      // this.navCtrl.push(MessagingPage);
    })
    
    
  }

}
