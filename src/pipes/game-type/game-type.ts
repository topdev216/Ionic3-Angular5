import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the GameTypePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'gameType',
})
export class GameTypePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(items:any[],filter: any) {
      if (!items || !filter) {
        return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(item => item.type.indexOf(filter.type) !== -1);
  }
}
