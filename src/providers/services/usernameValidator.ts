import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from './dataService';
 
@Injectable()
export class UsernameValidator {
 
  debouncer: any;
 
  constructor(public dataService: DataService){
 
  }
 
  checkUsername(control: FormControl): any {
 
    clearTimeout(this.debouncer);
 
    return new Promise(resolve => {
 
      this.debouncer = setTimeout(() => {
 
        this.dataService.checkExistingUsername(control.value).then((res) => {
          if(res.ok){
            resolve(null);
          }
        }, (err) => {
          resolve({'usernameInUse': true});
        });
 
      }, 1000);     
 
    });
  }
 
}