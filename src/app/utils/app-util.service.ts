import { Injectable } from '@angular/core';
import { AlertType, APIResponse, MaxFileSize } from '../utils/app-enum';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { AppConstants } from '../utils/app-constants';
import { saveAs } from 'file-saver'
import { DomSanitizer } from '@angular/platform-browser';

import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material';
import { AppService } from 'app/main/services/app.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AppUtilService {

  public appTagsSubject: BehaviorSubject<any>;
  public appTags: Observable<any>;

  public appCitiesSubject: BehaviorSubject<any>;
  public appCities: Observable<any>;

  constructor(
    public snackBar: MatSnackBar,
    private _appService: AppService,
    private _httpClient: HttpClient
  ) {
    this.appTagsSubject = new BehaviorSubject<any>(null);
    this.appTags = this.appTagsSubject.asObservable();

    this.appCitiesSubject = new BehaviorSubject<any>(null);
    this.appCities = this.appCitiesSubject.asObservable();

    // this.getProjectTags();
    // this.getServiceCities();
  }

  showAlert(alertType: AlertType, message: string) {
    let alertString = ''

    let horizontalPosition: MatSnackBarHorizontalPosition = 'right';
    let verticalPosition: MatSnackBarVerticalPosition = 'top';

    if (alertType == AlertType.Error) {
      alertString = 'error';
    } else if (alertType == AlertType.Success) {
      alertString = 'success';
    } else {
      alertString = 'warning';
    }

    this.snackBar.open(message, 'x', {
      duration: 5000,
      panelClass: [alertString],
      horizontalPosition: horizontalPosition,
      verticalPosition: verticalPosition,
    });
  }


  static formatSizeUnits(bytes) {
    if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " GB"; }
    else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + " MB"; }
    else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + " KB"; }
    else if (bytes > 1) { bytes = bytes + " bytes"; }
    else if (bytes == 1) { bytes = bytes + " byte"; }
    else { bytes = "0 bytes"; }
    return bytes;
  }

  static checkMaxFileSize(files, maxFileSizeType) {
    var maxFileSize = 2000000;
    if (maxFileSizeType == MaxFileSize.FIVEMB) {
      maxFileSize = 5000000;
    }

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxFileSize) {
        return false;
      }
    }
    return true;
  }



  static getProvicesList() {
    return ['Alberta - AB',
      'British Columbia - BC',
      'Manitoba - MB',
      'New Brunswick - NB',
      'Newfoundland and Labrador - NL',
      'Nova Scotia - NS',
      'Ontario - ON',
      'Prince Edward Island - PE',
      'Quebec - QC',
      'Saskatchewan - SK',
      'Northwest Territories - NT',
      'Nunavut - NU',
      'Yukon - YT']
  }


  downloadFile(containerName: string, blobName: string, fileName: string, fileType: string) {

    let fileUrl = AppConstants.downloadFileURL + containerName + '/blob/' + blobName;
    this._httpClient.get(fileUrl, { responseType: 'blob' }).subscribe(data => {
      console.log(data);
      var blob = new Blob([data], { type: fileType });
      var url = window.URL.createObjectURL(blob);
      saveAs(blob, fileName);
      window.open(url);
    });
  }

  downloadFileFromUrl(fileUrl: string, fileName: string, fileType: string) {
    this._httpClient.get(fileUrl, { responseType: 'blob' }).subscribe(data => {
      console.log(data);
      var blob = new Blob([data], { type: fileType });
      var url = window.URL.createObjectURL(blob);
      saveAs(blob, fileName);
      window.open(url);
    });
  }

  downloadBase64File(contentType, base64Data, fileName) {
    const linkSource = `data:${contentType};base64,${base64Data}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  getProjectTags() {
    this._appService.getProjectTagList().subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.appTagsSubject.next(response.tags);
      } else {
        console.log("Unable to download tags");
      }
    }, err => {
      console.log("Unable to download tags");
    });
  }

  getServiceCities() {
    this._appService.getSupportedCitiesList().subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.appCitiesSubject.next(response.serviceCities);
      } else {
        console.log("Unable to download cities");
      }
    }, err => {
      console.log("Unable to download cities");
    });
  }

}
