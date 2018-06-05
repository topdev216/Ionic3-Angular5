import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../providers/services/dataService';
import { UsernameValidator } from '../../providers/services/usernameValidator';

/**
 * Generated class for the AddUsernamePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-username',
  templateUrl: 'add-username.html',
})
export class AddUsernamePage {

  private username:string;
  private postForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams
    , public formBuilder: FormBuilder
    , public dataService: DataService
    , public usernameValidator: UsernameValidator) {

      this.postForm = formBuilder.group({
        username: ['value', Validators.compose([Validators.required,Validators.minLength(8)])]
      });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddUsernamePage');
  }

  private submitUsername(form: any) :void{
    this.dataService.checkExistingUsername(form.username)
    .then((result) =>{
      if(result.val() == null){
        this.dataService.updateUserToDatabase('username',form.username)
        .then(() =>{
          console.log('username updated!');
          this.navCtrl.popToRoot();
        })
        .catch((error)=>{
          console.log('something happened');
        })
      }
      else{
        alert('username exists!')
      }
    })
  }



}
