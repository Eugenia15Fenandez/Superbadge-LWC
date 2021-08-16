//Create the component boatsNearMe and show boats that are 
//near the user, using the browser location and boat type. 
//Display them on a map, always with the consent of the user 
//(and only while the page is open)

import { LightningElement, wire, api } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire (getBoatsByLocation, {boatTypeId: '$boatTypeId', longitud: '$longitude', latitude: '$latitude'})
  wiredBoatsJSON({error, data}) { 
    if (data) {
        this.error = undefined;
        this.createMapMarkers(data);
      } else if (error){
         // ShowToastEvent(){ 
              const event = new ShowToastEvent({
                  title: ERROR_TITLE,
                  message: error.body.message,
                  variant: ERROR_VARIANT,
              });
              this.dispatchEvent(event);
              this.isLoading = false;
           // }
      }
    }  
   
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() {
      if (this.isRendered == false){
          this.getLocationFromBrowser();
      }
      this.isRendered = true;
  }

  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() { 
    navigator.geolocation.getCurrentPosition(
      position => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
        }
    );
    }


  
  // Creates the map markers
  createMapMarkers(boatData) {
    this.mapMarkers = boatData.map(boat => {
         return{
             location:{
                 Latitude: boat.Geolocation__Latitude__s,
                 Longitude: boat.Geolocation__Longitude__s,
             },
             title:boat.Name,
         };
     });
     this.newMarkers.unshift({
        location: {
            Latitude: this.latitude,
            Longitude: this.longitude
            },
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER
     });
     this.isLoading = false;
   }
}