import { NgModule } from '@angular/core';
import { ErrorCardComponent } from './error-card/error-card';
import { MenuComponent } from './menu/menu';
import { PopoverComponent } from './popover/popover';
@NgModule({
	declarations: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent],
	imports: [],
	exports: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent]
})
export class ComponentsModule {}
