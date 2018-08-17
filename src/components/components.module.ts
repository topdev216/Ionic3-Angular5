import { NgModule } from '@angular/core';
import { ErrorCardComponent } from './error-card/error-card';
import { MenuComponent } from './menu/menu';
import { PopoverComponent } from './popover/popover';
import { TradeCardComponent } from './trade-card/trade-card';
import { PopoverHeaderComponent } from './popover-header/popover-header';
import { ActionPopoverComponent } from './action-popover/action-popover';
@NgModule({
	declarations: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent,
    TradeCardComponent,
    PopoverHeaderComponent,
    ActionPopoverComponent],
	imports: [],
	exports: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent,
    TradeCardComponent,
    PopoverHeaderComponent,
    ActionPopoverComponent]
})
export class ComponentsModule {}
