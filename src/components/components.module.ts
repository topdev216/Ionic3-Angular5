import { NgModule } from '@angular/core';
import { ErrorCardComponent } from './error-card/error-card';
import { MenuComponent } from './menu/menu';
import { PopoverComponent } from './popover/popover';
import { TradeCardComponent } from './trade-card/trade-card';
import { PopoverHeaderComponent } from './popover-header/popover-header';
import { ActionPopoverComponent } from './action-popover/action-popover';
import { AccordionComponent } from './accordion/accordion';
import { NotificationPopoverComponent } from './notification-popover/notification-popover';
import { FriendPopoverComponent } from './friend-popover/friend-popover';
import { PartnerPopoverComponent } from './partner-popover/partner-popover';
@NgModule({
	declarations: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent,
    TradeCardComponent,
    PopoverHeaderComponent,
    ActionPopoverComponent,
    AccordionComponent,
    NotificationPopoverComponent,
    FriendPopoverComponent,
    PartnerPopoverComponent],
	imports: [],
	exports: [ErrorCardComponent,
    MenuComponent,
    PopoverComponent,
    TradeCardComponent,
    PopoverHeaderComponent,
    ActionPopoverComponent,
    AccordionComponent,
    NotificationPopoverComponent,
    FriendPopoverComponent,
    PartnerPopoverComponent]
})
export class ComponentsModule {}
