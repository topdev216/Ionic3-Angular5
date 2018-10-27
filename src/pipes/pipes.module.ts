import { NgModule } from '@angular/core';
import { GameTypePipe } from './game-type/game-type';
import { JoinPipe } from './join/join';
@NgModule({
	declarations: [GameTypePipe,
    JoinPipe],
	imports: [],
	exports: [GameTypePipe,
    JoinPipe]
})
export class PipesModule {}
