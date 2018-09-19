import { NgModule } from '@angular/core';
import { ErrorCardComponent } from './error-card/error-card';
import { MenuComponent } from './menu/menu';
import { PopoverComponent } from './popover/popover';
import { TradeCardComponent } from './trade-card/trade-card';
import { PopoverHeaderComponent } from './popover-header/popover-header';
import { ActionPopoverComponent } from './action-popover/action-popover';
import { AccordionComponent } from './accordion/accordion';
import { NotificationPopoverComponent } from './notification-popover/notification-popover';
@NgModule({
	declarations: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent,
    TradeCardComponent,
    PopoverHeaderComponent,
    ActionPopoverComponent,
    AccordionComponent,
    NotificationPopoverComponent],
	imports: [],
	exports: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent,
    TradeCardComponent,
    PopoverHeaderComponent,
    ActionPopoverComponent,
    AccordionComponent,
    NotificationPopoverComponent]
})
export class ComponentsModule {}
