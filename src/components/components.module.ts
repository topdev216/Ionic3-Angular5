import { NgModule } from '@angular/core';
import { ErrorCardComponent } from './error-card/error-card';
import { MenuComponent } from './menu/menu';
@NgModule({
	declarations: [ErrorCardComponent,
    MenuComponent],
	imports: [],
	exports: [ErrorCardComponent,
    MenuComponent]
})
export class ComponentsModule {}
