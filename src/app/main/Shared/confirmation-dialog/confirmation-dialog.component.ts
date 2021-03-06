import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface DialogData {
  type: DialogType;
  title : string;
  message:string;
  yesButtonTitle:string;
  noButtonTitle:string;
}

export enum DialogType {
  TwoButtonDialog = 1,
  OneButtonDialog = 2
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})


export class ConfirmationDialogComponent implements OnInit {

  title = 'Test';
  message = 'Test message';
  yesButtonTitle = 'Yes';
  noButtonTitle = 'No';
  shouldShowNoButton = true;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { 
      if(data != null) {
        this.title = data.title;
        this.message = data.message;
        this.yesButtonTitle = data.yesButtonTitle;
        this.noButtonTitle = data.noButtonTitle;

        if(data.type == DialogType.OneButtonDialog){
          this.shouldShowNoButton = false;
        }
      }
    }

  ngOnInit() {

  }

}
