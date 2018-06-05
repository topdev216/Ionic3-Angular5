import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectSearchableComponent } from 'ionic-select-searchable';
import { VideogameInterface } from '../../providers/interfaces/videogameInterface'; 
import { DataService } from '../../providers/services/dataService';

/**
 * Generated class for the AddVideogamePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-videogame',
  templateUrl: 'add-videogame.html',
})
export class AddVideogamePage {

  private postForm: FormGroup;
  private game: VideogameInterface;
  private games: VideogameInterface[];
  private type: string;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public formBuilder: FormBuilder
  , private dataService : DataService) {
    

    this.postForm = formBuilder.group({
      title: ['', Validators.compose([Validators.required])],
      year: ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      genre: ['', Validators.compose([Validators.required])],
      rating: ['', Validators.compose([Validators.required])],
      console: ['', Validators.compose([Validators.required])],
      frontPhoto: ['', Validators.compose([Validators.required])],
      backPhoto: ['', Validators.compose([Validators.required])],
      game: ['', Validators.compose([Validators.required])],
      type: ['', Validators.compose([Validators.required])],
    });

    this.type = "offer";


  }

  ionViewWillEnter(){
   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddVideogamePage');
  }

  private submitVideogame() :void{

  }

  private gameChange(event: { component: SelectSearchableComponent, value: any }) :void {
    console.log('port:', event.value);
}

}
