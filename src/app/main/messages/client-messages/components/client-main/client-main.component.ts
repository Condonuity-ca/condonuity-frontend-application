import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef, ViewChild, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl, FormArray } from '@angular/forms';
import { fuseAnimations } from '@condonuity/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MessageService } from 'app/main/messages/service/message.service';
export interface DialogData {

}


@Component({
    selector: 'client-main',
    templateUrl: './client-main.component.html',
    styleUrls: ['./client-main.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ClientMainComponent implements OnInit, OnDestroy {
    about: any;
    selectedTabIndex = 0;
    private _unsubscribeAll: Subject<any>;
    constructor(
        public dialog: MatDialog,
        private _messageService: MessageService

    ) {
        this._unsubscribeAll = new Subject();
        this._messageService.selectedMessageTab.pipe(takeUntil(this._unsubscribeAll)).subscribe(selectedIndex => {
            if (selectedIndex != null) {
                this.selectedTabIndex = selectedIndex;
            }
        });
    }

    changeTab(event) {
        this._messageService.selectedMessageTabSubject.next(event.index);
    }


    ngOnInit(): void {
    }


    ngOnDestroy(): void {

    }
}