import { LightningElement } from 'lwc';

export default class LeaveTracker extends LightningElement {
    refreshLeaveRequestsHandler(event){
        this.refreshLeaveRequestsHandler.myLeavesComp.refreshGrid();
    }
}