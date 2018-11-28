import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';

/**
 * Generated class for the LogsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-logs',
  templateUrl: 'logs.html',
})
export class LogsPage {

  logs: any [] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams
    , public dataService: DataService
    , public zone: NgZone) {

      this.dataService.serverLogsService();

      this.zone.run(()=>{
        this.logs = []
        this.logs = this.dataService.serverLogs;
        console.log('inicial logs:',this.logs);
      })
     
      this.dataService.serverLogsChanges.subscribe((values)=>{
        this.zone.run(()=>{
          this.logs = [];
          this.logs = values;
          console.log('received logs:',this.logs);
        })
      })
  }

  ngOnInit(){

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LogsPage');
  }

}
