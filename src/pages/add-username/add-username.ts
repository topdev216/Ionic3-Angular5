import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../providers/services/dataService';
import { UsernameValidator } from '../../validators/username';

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

  // username:string;
  postForm: FormGroup;
  tabBar : any;
  validation_messages:any;
  isValid:boolean = false;
  submitAttempt:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams
    , public formBuilder: FormBuilder
    , public dataService: DataService
    , public usernameValidator: UsernameValidator
    , public loadingCtrl: LoadingController
    ,public zone: NgZone) {

      this.tabBar = document.querySelector('.tabbar.show-tabbar');

      this.validation_messages = {
        'username': [
            { type: 'required', message: 'Username is required.' },
            { type: 'minlength', message: 'Username must be at least 6 characters long.' },
            { type: 'maxlength', message: 'Username cannot be more than 25 characters long.' },
            { type: 'pattern', message: 'Your username must contain only numbers and letters.' },
            { type: 'usernameInUse', message: 'Your username has already been taken.' }
          ]
        };

      this.zone.run(()=>{
  
        this.postForm = formBuilder.group({
          username: ['', Validators.compose([
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(25),
            Validators.pattern('^[A-Za-z0-9_]{6,25}$'),
          ]),
        usernameValidator.checkUsername.bind(usernameValidator)
        ]
        });
      });
     

  }

  // ngAfterViewInit(){
  //   this.tabBar = document.querySelector('.tabbar.show-tabbar');
  // }

  ionViewWillEnter(){
    this.tabBar.style.display = 'none';

      
      this.postForm.valueChanges.subscribe((data)=>{
        if(this.postForm.valid){
            this.isValid = true;
          
          console.log('the form is valid');
        }
        else{
            this.isValid = false;
          
          console.log('the form is invalid');
        }
      })

    
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'flex';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddUsernamePage');
  }

  private submitUsername(form:any) :void{
    
    this.zone.run(()=>{
      this.submitAttempt = true;
    })
    if(!form.valid){
      console.log('form invalid');
    }
    else{
      let loader = this.loadingCtrl.create({
        content:'Please wait...',
        spinner:'crescent'
      });
      loader.present();
      console.log('success');
      this.dataService.updateUserToDatabase('username',form.value.username).then(()=>{
        loader.dismiss();
        this.navCtrl.popToRoot();
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
    }

  }



}
