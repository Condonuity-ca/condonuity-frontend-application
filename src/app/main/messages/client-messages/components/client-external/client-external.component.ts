import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject, Input } from '@angular/core';
import { Subject, Observable, from } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppService } from '../../../../services/app.service';
import { Message } from 'app/main/messages/Model/message.model';
import { AuthenticationService } from 'app/_services/authentication.service';
import { AppUtilService } from 'app/utils/app-util.service';
import { MenuService } from 'app/layout/components/toolbar/menu.service';
import { MessageService } from 'app/main/messages/service/message.service';
import { Router } from '@angular/router';
import { APIResponse, AppDateFormat, AlertType, AppLiterals, MessageType, UserType, SearchBarPageIndex, MaxFileSize } from 'app/utils/app-constants';
import * as moment from 'moment';
import { Organization } from 'app/main/messages/Model/organization.model';
import { SearchService } from 'app/layout/components/toolbar/service/search.service';

export interface DialogData {
  userData: any;
  orgList: Organization[]
}

@Component({
  selector: 'client-external',
  templateUrl: './client-external.component.html',
  styleUrls: ['./client-external.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ClientExternalComponent implements OnInit, OnDestroy {

  pageOfItems: Array<any> = [];

  // selectedOrganization: any;
  currentUser: any;
  externalMessages: Message[];
  organizationList: Organization[] = [];

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
    this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.EXTERNAL_MESSAGES);

    this._searchService.externalMessagesSearchResults.pipe(takeUntil(this._unsubscribeAll)).subscribe(messages => {
      if (messages != null) {
        this.populateInternalMessage(messages);
      }
    });

    this._searchService.clearSearchForIndex.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchIndex => {
      if (searchIndex != null && searchIndex == SearchBarPageIndex.EXTERNAL_MESSAGES) {
        if (this.currentUser.userType == UserType.Vendor) {
          this.getExternalMessageList(this.currentUser.vendorOrganisationId, this.currentUser.userType, this.currentUser.userId)
        } else if (this.currentUser.userType == UserType.Client) {
          this.getExternalMessageList(this.currentUser.currentOrgId, this.currentUser.userType, this.currentUser.clientId);
        }
        this._searchService.clearSearchSubject.next(null);
      }
    });

    this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
      this.currentUser = userData;
      if (this.currentUser.userType == UserType.Client) {
        this.getVendorOrgList();
      }
      if (this.currentUser.userType == UserType.Vendor) {
        this.getExternalMessageList(this.currentUser.vendorOrganisationId, this.currentUser.userType, this.currentUser.userId)
      } else if (this.currentUser.userType == UserType.Client) {
        this.getExternalMessageList(this.currentUser.currentOrgId, this.currentUser.userType, this.currentUser.clientId);
      }
    });
  }

  openCreateThreadExternalDialog() {
    const CreateThreadDialogRef = this.dialog.open(CreateThreadExternalDialog, { data: { userData: this.currentUser, orgList: this.organizationList }, width: '700px', height: 'auto' });
    CreateThreadDialogRef.afterClosed().subscribe(result => {
      if (result != undefined && result != '') {
        if (this.currentUser.userType == UserType.Client) {
          this.getExternalMessageList(this.currentUser.currentOrgId, this.currentUser.userType, this.currentUser.clientId);
        } else if (this.currentUser.userType == UserType.Vendor) {
          this.getExternalMessageList(this.currentUser.vendorOrganisationId, this.currentUser.userType, this.currentUser.userId)
        }
      }
    });
  }


  ngOnInit(): void {
    this.getCondoOrgList();
  }

  onChangePage(pageOfItems: Array<any>) {
    this.pageOfItems = pageOfItems;
  }

  getExternalMessageList(organizationId, userType, userId) {
    this._appService.getExternalMessageList(organizationId, userType, userId).subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        this.populateInternalMessage(response.externalMessages);
      } else {
        this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToRetreiveMessages);
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }


  populateInternalMessage(externalMessages) {
    externalMessages.forEach(message => {
      var localTime = moment.utc(message.createdAt).toDate();
      message.formatedCreatedDate = moment(localTime).format(AppDateFormat.DisplayFormatWithTime);
      message.messageType = MessageType.ExternalMessage;
      if (message.fromUser == null) {
        message.fromUser = [];
        message.fromUser.profileImageURL = '';
      }
      message.comments.forEach(comment => {
        var localTime = moment.utc(comment.createdAt).toDate();
        comment.formatedCreatedDate = moment(localTime).format(AppDateFormat.DisplayFormatWithTime);
        if (comment.files == null) {
          comment.files = [];
        }
        return comment;
      })
      return message;
    });

    this.externalMessages = externalMessages;
    this.externalMessages.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });
  }


  getCondoOrgList() {
    this._appService.getClientOrganizationList('').subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        let condoList = response.clientOrganisations;
        condoList.forEach(condo => {
          let org = new Organization();
          org.organizationId = condo.clientOrganisationId;
          org.organizationName = condo.organisationName;
          org.organizationType = UserType.Client;
          this.organizationList.push(org);
        })
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
  }

  getVendorOrgList() {
    this._appService.getVendorOrganizationList().subscribe((response) => {
      if (response.statusCode == APIResponse.Success) {
        let vendorsList = response.vendorOrgs;
        vendorsList.forEach(vendor => {
          let org = new Organization();
          org.organizationId = vendor.vendorOrganisationId;
          org.vendorProfileId = vendor.vendorProfileId;
          org.organizationName = vendor.companyName;
          org.organizationType = UserType.Vendor;
          this.organizationList.push(org);
        });

        this.organizationList = this.organizationList.filter(org => (org.vendorProfileId == 0 && org.organizationId > 0) || org.organizationType == UserType.Client)
      }
    }, err => {
      this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
    });
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
        this.externalMessages.sort((a, b) => a.threadSubject.localeCompare(b.threadSubject));
        this.shouldSortReverse = true;
      } else {
        this.externalMessages.sort((a, b) => b.threadSubject.localeCompare(a.threadSubject));
        this.shouldSortReverse = false;
      }
    } else if (type == 2) {
      this.sortType = 'by org name';
      if (!this.shouldSortReverse) {
        this.externalMessages.sort((a, b) => a.fromOrganisation.organisationName.localeCompare(b.fromOrganisation.organisationName));
        this.shouldSortReverse = true;
      } else {
        this.externalMessages.sort((a, b) => b.fromOrganisation.organisationName.localeCompare(a.fromOrganisation.organisationName));
        this.shouldSortReverse = false;
      }
    } else if (type == 3) {
      this.sortType = 'messge date';
      if (!this.shouldSortReverse) {
        this.externalMessages.sort((a, b) => { return <any>new Date(a.createdAt) - <any>new Date(b.createdAt) });
        this.shouldSortReverse = true;
      } else {
        this.externalMessages.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });
        this.shouldSortReverse = false;
      }
    }
    this.externalMessages = [...this.externalMessages];
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
export class CreateThreadExternalDialog {
  createThreadExternalform: FormGroup;
  messageAttachments: any[];
  currentUser: any;
  orgList: Organization[];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  tagCtrl = new FormControl();
  filteredOrgs: Observable<Organization[]>;
  selectedOrgs: Organization[] = [];

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  constructor(
    private _appUtil: AppUtilService,
    private _appService: AppService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CreateThreadExternalDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    debugger;
    this.currentUser = data.userData;
    this.orgList = data.orgList;
    this.orgList.sort((a, b) => a.organizationName.localeCompare(b.organizationName));

    this.createThreadExternalform = this._formBuilder.group({
      organization: [''],
      subject: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.filteredOrgs = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((data: Organization | null) => data ? this._filter(data) : this.orgList.slice()));
  }


  private _filter(value): Organization[] {

    if (this.currentUser.userType == UserType.Vendor && this.selectedOrgs.length > 0) {
      return;
    }

    let return_value: any;
    if (this.orgList.includes(value)) {
      return_value = this.orgList.filter((data: Organization) => data.organizationName.toLowerCase().indexOf(value) === 0);
      this.selectedHandle(value);
    } else {
      const filterValue = value.toLowerCase();
      return_value = this.orgList.filter((data: Organization) => data.organizationName.toLowerCase().indexOf(filterValue) === 0);
    }
    return return_value;
  }

  private selectedHandle(value: Organization) {
    let index = this.orgList.indexOf(value)
    this.orgList.splice(index, 1);
    this.orgList.sort((a, b) => a.organizationName.localeCompare(b.organizationName));
    this.createThreadExternalform.get('organization').setValue(this.selectedOrgs);
  }

  remove(data: Organization): void {
    const index = this.selectedOrgs.indexOf(data);
    if (index >= 0) {
      this.selectedOrgs.splice(index, 1);
      this.orgList.push(data);
      this.orgList.sort((a, b) => a.organizationName.localeCompare(b.organizationName));
      this.tagCtrl.setValue(null);
      this.createThreadExternalform.get('organization').setValue(this.selectedOrgs);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (this.currentUser.userType == UserType.Vendor && this.selectedOrgs.length > 0) {
      return;
    }
    this.selectedOrgs.push(event.option.value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
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


  postExternalMessage() {
    let formValue = this.createThreadExternalform.value;
    let toOrgList = [];

    this.selectedOrgs.forEach(org => {
      toOrgList.push({
        "targetUserType": org.organizationType,
        "targetOrganisationId": org.organizationId
      });
    });


    let orgId = '';
    let currentUserId = '';

    if (this.currentUser.userType == UserType.Client) {
      orgId = this.currentUser.currentOrgId;
      currentUserId = this.currentUser.clientId;
    } else if (this.currentUser.userType == UserType.Vendor) {
      orgId = this.currentUser.vendorOrganisationId;
      currentUserId = this.currentUser.userId;
    }


    let messageDetails = {
      "sourceOrganisationId": orgId,
      "sourceUserId": currentUserId,
      "sourceUserType": this.currentUser.userType,
      "threadDescription": formValue.description,
      "threadSubject": formValue.subject
    }

    let newMessageDetails = {
      "externalMessage": messageDetails,
      "targetOrganisations": toOrgList
    }

    this._appService.postNewExternalMessage(newMessageDetails).subscribe((response: any) => {
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
      this._appService.uploadFileForExternalMessage(attachment.file, messageId).subscribe((response: any) => {
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
