import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe, formatDate } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from '../../../../services/app.service';
import { CommonFunctionsService } from '../../../../../../app/_services/common-functions.service';
import { SearchBarPageIndex, MessageType, UserType, MaxFileSize } from "../../../../../utils/app-constants";
import { AuthenticationService } from 'app/_services/authentication.service';
import { MenuService } from '../../../../../layout/components/toolbar/menu.service';
import { AppUtilService } from '../../../../../utils/app-util.service';
import { APIResponse, AppLiterals, AlertType, AppDateFormat } from '../../../../../utils/app-constants';


import { resetFakeAsyncZone } from '@angular/core/testing';
import { Message } from 'app/main/messages/Model/message.model';
import * as moment from 'moment';
import { MessageService } from 'app/main/messages/service/message.service';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';

export interface DialogData {
  userData: any;
}


@Component({
  selector: 'client-internal',
  templateUrl: './client-internal.component.html',
  styleUrls: ['./client-internal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ClientInternalComponent implements OnInit, OnDestroy {
  pageOfItems: Array<any> = [];

  @Input()

  // selectedOrganization: any;
  currentUser: any;
  internalMessages: Message[];

  sortType: string;
  lastAppliedFilter = 0;
  shouldSortReverse = false;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {ProfileService} _profileService
   */
  constructor(
    private _authService: AuthenticationService,
    private _appUtil: AppUtilService,
    private _menuService: MenuService,
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _messageService: MessageService,
    private router: Router,
    public dialog: MatDialog,
    private _searchService: SearchService

  ) {
    this._unsubscribeAll = new Subject();

    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.INTERNAL_MESSAGES);

    this._searchService.internalMessagesSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(messages => {
      if (messages != null) {
        this.populateInternalMessage(messages);
      }
    });

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentUser = userData;
      if (this.currentUser.userType == UserType.Vendor) {
        this.getInternalMessageList(this.currentUser.vendorOrganisationId, this.currentUser.userType, this.currentUser.userId)
      } else {
        this.getInternalMessageList(this.currentUser.currentOrgId, this.currentUser.userType, this.currentUser.clientId);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.INTERNAL_MESSAGES) {
        if (this.currentUser.userType == UserType.Vendor) {
          this.getInternalMessageList(this.currentUser.vendorOrganisationId, this.currentUser.userType, this.currentUser.userId)
        } else if (this.currentUser.userType == UserType.Client) {
          this.getInternalMessageList(this.currentUser.currentOrgId, this.currentUser.userType, this.currentUser.clientId);
        }
        this._searchService.clearSearchSubject.next(null);
      }
    });
  }


  openCreateThreadDialog() {
    const CreateThreadDialogRef = this.dialog.open(CreateThreadDialog, { data: { userData: this.currentUser }, width: '600px', height: 'auto' });
    CreateThreadDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        if (this.currentUser.userType == UserType.Client) {
          this.getInternalMessageList(this.currentUser.currentOrgId, this.currentUser.userType, this.currentUser.clientId);
        } else if (this.currentUser.userType == UserType.Vendor) {
          this.getInternalMessageList(this.currentUser.vendorOrganisationId, this.currentUser.userType, this.currentUser.userId);
        }
      }
    });
  }

  ngOnInit(): void {
  }

  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  getInternalMessageList(organizationId, userType, userId) {
    this._appService.getInternalMessageList(organizationId, userType, userId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {

        this.populateInternalMessage(response.internalMessages);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToRetreiveMessages);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  populateInternalMessage(internalMessages) {
    internalMessages.forEach(message => {
      var createdDate = moment.utc(message.createdAt).toDate();
      message.formatedCreatedDate = moment(createdDate).format(AppDateFormat.DisplayFormatWithTime);
      message.messageType = MessageType.InternalMessage;
      if (message.user == null) {
        message.user = [];
        message.user.profileImageURL = '';
      }
      message.comments.forEach(comment => {
        var createdDate = moment.utc(comment.createdAt).toDate();
        comment.formatedCreatedDate = moment(createdDate).format(AppDateFormat.DisplayFormatWithTime);
        return comment;
      })
      return message;
    });

    this.internalMessages = internalMessages;
    this.internalMessages.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });
  }


  viewMessageDetails(message) {
    this._messageService.messageSubject.next(message);
    this.router.navigate(['/messages/clientMessages/view'], { skipLocationChange: true });
  }

  attachmentClicked(event, fileDetails) {
    event.stopPropagation();
    this._appUtil.downloadFile(fileDetails.containerName, fileDetails.blobName, fileDetails.fileName, fileDetails.fileType);
  }


  sortMessages(type) {

    if (this.lastAppliedFilter != type) {
      this.shouldSortReverse = false;
    }

    if (type == 1) {
      this.sortType = 'subject';
      if (!this.shouldSortReverse) {
        this.internalMessages.sort((a, b) => a.threadSubject.localeCompare(b.threadSubject));
        this.shouldSortReverse = true;
      } else {
        this.internalMessages.sort((a, b) => b.threadSubject.localeCompare(a.threadSubject));
        this.shouldSortReverse = false;
      }
    } else if (type == 2) {
      this.sortType = 'user';
      if (!this.shouldSortReverse) {
        this.internalMessages.sort((a, b) => a.user.firstName.localeCompare(b.user.firstName));
        this.shouldSortReverse = true;
      } else {
        this.internalMessages.sort((a, b) => b.user.firstName.localeCompare(a.user.firstName));
        this.shouldSortReverse = false;
      }
    } else if (type == 3) {

      this.sortType = 'date';
      if (!this.shouldSortReverse) {
        this.internalMessages.sort((a, b) => { return <any>new Date(a.createdAt) - <any>new Date(b.createdAt) });
        this.shouldSortReverse = true;
      } else {
        this.internalMessages.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });
        this.shouldSortReverse = false;
      }
    }

    this.internalMessages = [...this.internalMessages];
    this.lastAppliedFilter = type;
  }



  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}


@Component({
  selector: 'create-thread-dialog',
  templateUrl: 'create-thread-dialog.html',
  animations: fuseAnimations

})
export class CreateThreadDialog {
  createThreadform: FormGroup;
  messageAttachments: any[];
  currentUser: any;

  constructor(
    private _appUtil: AppUtilService,
    private _appService: AppService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CreateThreadDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    this.currentUser = data.userData;

    this.createThreadform = this._formBuilder.group({
      subject: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  removeDocAttachment(index) {
    this.messageAttachments.splice(index, 1);
  }

  appendDocumentFiles(event) {
    let files = event.target.files;
    if (this.messageAttachments == null) {
      this.messageAttachments = [];
    }

    if (AppUtilService.checkMaxFileSize(files, MaxFileSize.FIVEMB)) {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        file.formatedSize = AppUtilService.formatSizeUnits(file.size);
        this.messageAttachments.push({
          "name": file.name,
          "formatedSize": file.formatedSize,
          "fileType": "1",
          "file": file
        });
      }
    }
    else {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
    }
  }

  postInternalMessage() {
    let formValue = this.createThreadform.value;

    let orgId = '';
    let currentUserId = '';

    if (this.currentUser.userType == UserType.Client) {
      orgId = this.currentUser.currentOrgId;
      currentUserId = this.currentUser.clientId;
    } else if (this.currentUser.userType == UserType.Vendor) {
      orgId = this.currentUser.vendorOrganisationId;
      currentUserId = this.currentUser.userId;
    }


    let newMessageDetails = {
      "organisationId": orgId,
      "userId": currentUserId,
      "userType": this.currentUser.userType,
      "threadDescription": formValue.description,
      "threadSubject": formValue.subject
    }

    this._appService.postNewInternalMessage(newMessageDetails).subscribe((response: any) => {
      if (response.statusCode == APIResponse.Success) {
        let messageId = response.threadId;
        if (this.messageAttachments != null && this.messageAttachments.length > 0) {
          this.postMessageAttachments(messageId);
        } else {
          this._appUtil.showAlert(AlertType.Success, AppLiterals.newMessageCreationSuccess);
          this.dialogRef.close(true);
        }
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.newMessageCreationSuccess);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.CharacterLongError);
    });
  }

  postMessageAttachments(messageId) {
    let successfileUpload = 0;
    this.messageAttachments.forEach(attachment => {
      this._appService.uploadFileForInternalMessage(attachment.file, messageId).subscribe((response: any) => {
        if (response.statusCode == APIResponse.Success) {
          successfileUpload = successfileUpload + 1;
          if (successfileUpload == this.messageAttachments.length) {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.newMessageCreationSuccess);
            this.dialogRef.close(true);
          }
        } else {
          this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        }
      }, err => {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        console.log(err);
      });
    });
  }
}


