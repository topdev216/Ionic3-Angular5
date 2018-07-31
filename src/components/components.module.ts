import { NgModule } from '@angular/core';
import { ErrorCardComponent } from './error-card/error-card';
import { MenuComponent } from './menu/menu';
import { PopoverComponent } from './popover/popover';
import { TradeCardComponent } from './trade-card/trade-card';
@NgModule({
	declarations: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent,
    TradeCardComponent],
	imports: [],
	exports: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent,
    TradeCardComponent]
})
export class ComponentsModule {}
