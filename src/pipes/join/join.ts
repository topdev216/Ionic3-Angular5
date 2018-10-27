import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the JoinPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'joinPipe',
})
export class JoinPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform (input: any, character: string = ', '): any {
    
    let array = [];
    
    for(let i = 0 ; i < input.length ; i++){
      
        array.push(input[i].name);

    }

    return array.join(character);
  }
}
