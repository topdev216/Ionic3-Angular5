import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '../providers/services/dataService';
 
@Injectable()
export class UsernameValidator {
 
  debouncer: any;
 
  constructor(public dataService: DataService){
 
  }
 
  checkUsername(control: FormControl): any {
 
    clearTimeout(this.debouncer);
 
    return new Promise(resolve => {
 
      this.debouncer = setTimeout(() => {
 
        // this.authProvider.validateUsername(control.value).subscribe((res) => {
        //   if(res.ok){
        //     resolve(null);
        //   }
        // }, (err) => {
        //   resolve({'usernameInUse': true});
        // });

        this.dataService.checkExistingUsername(control.value).then((res) => {
            console.log('Checking username:',res.val());
            if(res.val() !== null){
                resolve({'usernameInUse':true});
            }
            else{
                resolve(null);
            }
        }, (err) =>{
            this.dataService.logError(err);
            resolve({'usernameInUse': true})
        });
 
      }, 1000);     
 
    });
  }
 
}