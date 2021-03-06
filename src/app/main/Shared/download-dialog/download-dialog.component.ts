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
  selector: 'app-download-dialog',
  templateUrl: './download-dialog.component.html',
  styleUrls: ['./download-dialog.component.scss']
})


export class DownloadDialogComponent implements OnInit {

  title = 'Test';
  message = 'Test message';
  yesButtonTitle = 'Yes';
  noButtonTitle = 'No';
  shouldShowNoButton = true;

  constructor(
    public dialogRef: MatDialogRef<DownloadDialogComponent>,
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
