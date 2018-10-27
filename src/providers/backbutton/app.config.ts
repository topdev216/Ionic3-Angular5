export var EN_TAB_PAGES = {
    EN_TP_HOME: 0,
    EN_TP_TRADES:1,
    EN_TP_CHAT: 2,
    EN_TP_DISCOVERY:3,
    EN_TP_PROFILE:4,
    EN_TP_LENGTH: 5,
    }
    //A global variable 
export var Globals = {
    //Nav ctrl of each tab page
    navCtrls : new Array(EN_TAB_PAGES.EN_TP_LENGTH),
    tabIndex:0, //Index of the current tab
    tabs: <any>{}, //Hook to the tab object
}