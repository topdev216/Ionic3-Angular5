import { Component,Input } from '@angular/core';
import { DataService } from '../../providers/services/dataService'; 

/**
 * Generated class for the ErrorCardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'error-card',
  templateUrl: 'error-card.html'
})
export class ErrorCardComponent {

  dismissed: boolean = false;

  @Input()
  private errorMessage:string;

  constructor(public dataService: DataService) {
    
  }

  private dismiss() :void{
    this.dataService.errorDismissed(true);
    this.dismissed = true;
  }

}
