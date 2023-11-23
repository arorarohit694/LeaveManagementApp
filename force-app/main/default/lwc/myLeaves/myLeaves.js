import { LightningElement, wire } from 'lwc';
import getMyLeaves from '@salesforce/apex/LeaveRequstController.getMyLeaves';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
import {refreshApex} from '@salesforce/apex';
const COLUMNS =[
    {label:'Request Id',fieldName:'Name',cellAttributes:{class:{fieldName:'cellClass'}}},
    {label:'From Date',fieldName:'From_Date__c',cellAttributes:{class:{fieldName:'cellClass'}}},
    {label:'To Date',fieldName:'To_Date__c',cellAttributes:{class:{fieldName:'cellClass'}}},
    {label:'Reason',fieldName:'Reason__c',cellAttributes:{class:{fieldName:'cellClass'}}},
    {label:'Status',fieldName:'Status__c',cellAttributes:{class:{fieldName:'cellClass'}}},
    {label:'Manager Comment',fieldName:'Manager_Comment__c',cellAttributes:{class:{fieldName:'cellClass'}}},

    {
        type:"button",typeAttributes:{
            label:'Edit',
            name:'Edit',
            title:'Edit',
            value:'edit',
            disabled:{fieldName:'isEditDisabled'}
        },cellAttributes:{class:{fieldName:'cellClass'}}
    }
];

export default class MyLeaves extends LightningElement {
    columns=COLUMNS;
    myLeaves=[];
    myLeavesWireResult;
    showModalPopup=false;
    recordId ='';
    CurrentUserId =Id;
    objectApiName='LeaveRequest__c';
    @wire(getMyLeaves)
    wiredMyLeaves(result){
        this.MyLeavesWireResult=result;
        if(result.data){
            this.MyLeaves=result.data.map(a =>({
                ...a,
                cellClass:a.Status__c == 'Approved'?'slds-theme_success':a.Status__c =='Rejected' ? 'slds-theme_warning':'',
                isEditDisabled:a.Status__c!='Pending'
            }));
        }
        if(result.error){
            console.log('Error Occured while fetching my leaves-',result.error);
        }
    }
    onRequestClickHandler(){
        this.showModalPopup=true;
        this.recordId='';
    }
    popupCloseHandler(){
        this.showModalPopup=false;
    }
    rowActionHandler(event){
        this.showModalPopup=true;
        this.recordId=event.detail.row.Id;
    }
    successHandler(event){
        this.showModalPopup=false;
        const evt = ShowToastEvent({
            title :'SUCCESS',
            message :'Data saved successfully',
            variant :'success'
        });
        this.dispatchEvent(evt);
        refreshApex(this.MyLeavesWireResult);

        const refreshEvent = new CustomEvent('refreshleaverequests');
        this.dispatchEvent(refreshEvent);
    }
    OnSubmitHandler(event){
        event.preventDefault();
        const fields= { ...event.detail.fields };
        fields.Status__c ='Pending';
        if(new Date(fields.From_Date__c) > new Date(fields.To_Date__c)){
            const evt = ShowToastEvent({
                title :'ERROR',
                message :'To Date should be greater than from date',
                variant :'error'
            });
            this.dispatchEvent(evt);
        }
        else if(new Date()>new Date(fields.From_Date__c)){
            const evt = ShowToastEvent({
                title :'ERROR',
                message :'From date should be greater than today date',
                variant :'error'
            });
            this.dispatchEvent(evt);        }
        else{
            this.refs.leaveRequestsFrom.submit(fields);
        }
    }

}