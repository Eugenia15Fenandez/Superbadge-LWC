import { LightningElement, api, wire } from 'lwc';
import { subscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

import BOAT_OBJECT from '@salesforce/schema/Boat__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id'
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name'

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  @api boatId;
  wiredRecord;
  @api label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
  
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
      this.wiredRecord.data?'utility:anchor':null;
  }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {
       return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }
  // Private
  subscription = null;
  
  @wire(MessageContext)
  messageContext;

  @wire (getRecord, {recordId: '$boatId', fields: BOAT_FIELDS})
  wiredRecord;

  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => this.boatId = message.recordId,
        {scope: APPLICATION_SCOPE}
        );
    }

  // Calls subscribeMC()
  connectedCallback() {
        if (this.subscription) {
            return;
        }
        this.subscribeMC();      
    }
  
  // Navigates to record page
  navigateToRecordViewPage(event) {
        event.preventDefault();
        event.stopPropagation();
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                objectApiName: BOAT_OBJECT,
                actionName: 'view'
            }
        });
    }

    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated(event) { 
        this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
        this.template.querySelector('c-boat-reviews').refresh();
    }
}