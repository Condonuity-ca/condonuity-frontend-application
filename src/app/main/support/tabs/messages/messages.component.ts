import { Component, OnDestroy, OnInit, ViewEncapsulation, Inject, Input, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
// import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators,FormControl,FormArray } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { fuseAnimations } from '@condonuity/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppService } from '../../../services/app.service';
import { APIResponse, AlertType, AppLiterals, UserType, AppDateFormat, MessageType, SearchBarPageIndex } from 'app/utils/app-constants';
import { AppUtilService } from '../../../../utils/app-util.service'
import { AuthenticationService } from '../../../../../app/_services/authentication.service';
import { CondoBrowserService } from '../../../condo-browser/condo-browser.service';
import { MenuService } from '../../../../layout/components/toolbar/menu.service';
import { Aminity } from '../models/aminity.model';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { User } from 'app/main/account/models/user.model';
import * as moment from 'moment';
import { Message } from 'app/main/messages/Model/message.model';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';


export interface DialogData {
    userData;
    message;
}

@Component({
    selector: 'messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class MessagesComponent implements OnInit, OnDestroy {
    pageOfItems: Array<any> = [];
    condoSearchType = 1;
    condoUserform: FormGroup;
    externalMessages: Message[];

    condoList = [];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    condoCtrl = new FormControl();
    selectedCondos: any[] = [];
    filteredCondos: Observable<any[]>;

    userDetails: User[];
    isInputDisabled = false;

    currentUser: any;
    selectedOrganization: any;

    @ViewChild('condoInput', { static: false }) condoInput: ElementRef<HTMLInputElement>;

    sortType: string;
    lastAppliedFilter = 0;
    shouldSortReverse = false;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _appService: AppService,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        private _authService: AuthenticationService,
        private _menuService: MenuService,
        private _appUtil: AppUtilService
    ) {
        this._unsubscribeAll = new Subject();
        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.OTHERS);
        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(userData => {
            this.currentUser = userData;
        });
    }

    ngOnInit(): void {
        this.condoUserform = this._formBuilder.group({
            condos: [''],
            cityChips: ['']
        });
        this.getAllCondoList();
    }

    getAllCondoList() {
        this._appService.getAppClientOrgList().subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.condoList = response.clientOrganisations;
                this.condoList.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
                this.filteredCondos = this.condoCtrl.valueChanges.pipe(
                    startWith(null),
                    map((data: any | null) => data ? this._condoFilter(data) : this.condoList.slice()));
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToLoadCondoListMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    onChangePage(pageOfItems: Array<any>) {
        this.pageOfItems = pageOfItems;
    }

    searchTypeChanged(searchType) {
        if (this.selectedCondos.length > 0) {
            this.condoList.push(this.selectedCondos[0]);
            this.selectedCondos.splice(0, 1);
        }
        this.isInputDisabled = false;
        this.condoSearchType = searchType;
        if (searchType == 1) {
            this.condoList.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
        } else if (searchType == 2) {
            this.condoList.sort((a, b) => a.corporateNumber.localeCompare(b.corporateNumber));
        }
        this.externalMessages = [];
    }

    //**************  Condo Filter Starts *********************/
    private _condoFilter(value): any[] {
        let return_value: any;
        if (this.condoList.includes(value)) {
            return_value = this.condoList.filter((condo: any) => condo.organisationName.toLowerCase().indexOf(value) !== -1);
            this.selectedCondoHandle(value);
        } else {
            const filterValue = value.toLowerCase();
            return_value = this.condoList.filter((condo: any) => condo.organisationName.toLowerCase().indexOf(filterValue) !== -1);
        }
        return return_value;
    }

    private selectedCondoHandle(value: any) {
        let index = this.condoList.indexOf(value)
        this.condoList.splice(index, 1);
        this.condoList.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
        this.condoUserform.get('condos').setValue(this.selectedCondos);
        this.condoInput.nativeElement.blur();
        this.condoInput.nativeElement.focus();

    }

    removeCondo(data: any): void {
        const index = this.selectedCondos.indexOf(data);
        if (index >= 0) {
            this.isInputDisabled = false;
            this.selectedCondos.splice(index, 1);
            this.condoList.push(data);
            this.condoList.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
            this.condoCtrl.setValue(null);
            this.condoUserform.get('condos').setValue(this.selectedCondos);
            this.userDetails = [];
        }
    }

    selectCondo(event: MatAutocompleteSelectedEvent): void {
        this.isInputDisabled = true;
        this.selectedCondos.push(event.option.value);
        this.condoInput.nativeElement.value = '';
        this.condoCtrl.setValue(null);
        this.condoInput.nativeElement.blur();
        this.condoInput.nativeElement.focus();


        this.selectedOrganization = event.option.value;
        this.getExternalMessageList(this.selectedOrganization.clientOrganisationId, UserType.Client);
    }
    //**************** Condo filter ends  *********************/


    getExternalMessageList(organizationId, userType) {
        this._appService.getSupportExternalMessages(organizationId, userType).subscribe((response) => {
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
            var createdDate = moment.utc(message.createdAt).toDate();
            message.formatedCreatedDate = moment(createdDate).format(AppDateFormat.DisplayFormatWithTime);
            message.messageType = MessageType.ExternalMessage;

            if (message.fromUser == null) {
                message.fromUser = [];
                message.fromUser.profileImageURL = '';
            }
            message.comments.forEach(comment => {
                comment.formatedCreatedDate = moment.utc(comment.createdAt).format(AppDateFormat.DisplayFormatWithTime);
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


    viewMessageDetails(message) {
        const MessageDetailDialogRef = this.dialog.open(MessageDetailDialog, { data: { userData: this.currentUser, message: message }, width: '1100px', height: 'auto' });
        MessageDetailDialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                this.getExternalMessageList(this.selectedOrganization.clientOrganisationId, UserType.Client);
            }
        });
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}




@Component({
    selector: 'message-detail-dialog',
    templateUrl: 'message-detail-dialog.html',
    animations: fuseAnimations
})

export class MessageDetailDialog {
    message;
    currentUser;
    selectedUser;
    filterForm: FormGroup;
    constructor(
        private _appService: AppService,
        private _appUtil: AppUtilService,
        public dialog: MatDialog,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<MessageDetailDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.message = data.message;
        this.currentUser = data.userData;
    }

    updateMessage(status) {

        let confirmationMessage = '';

        if (status == 1) {
            confirmationMessage = AppLiterals.UnHideMessageConfirmation;
        } else {
            confirmationMessage = AppLiterals.HideMessageConfirmation;
        }

        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.TwoButtonDialog,
                title: "PLEASE CONFIRM",
                message: confirmationMessage,
                yesButtonTitle: "YES",
                noButtonTitle: "NO"
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                if (result == 'true') {
                    this.confirmMessageStatus(status);
                } else {
                    console.log("No tapped");
                }
            }
        });
    }

    confirmMessageStatus(status) {
        let updatedMessageDetails = {
            "externalMessageId": this.message.id,
            "activeStatus": status,
            "supportUserId": this.currentUser.id
        }

        this._appService.hideExternalMessage(updatedMessageDetails).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                if (status == 1) {
                    this._appUtil.showAlert(AlertType.Success, AppLiterals.UnHideMessageSuccessful);
                } else {
                    this._appUtil.showAlert(AlertType.Success, AppLiterals.HideMessageSuccessful);
                }
                this.dialogRef.close(true);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.HideMessageFailure);
                this.dialogRef.close(false);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });

    }
}