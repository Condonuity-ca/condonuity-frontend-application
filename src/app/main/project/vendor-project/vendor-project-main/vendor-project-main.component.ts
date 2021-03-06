import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@condonuity/animations';
import { MenuService } from "../../../../layout/components/toolbar/menu.service";
import { SearchBarPageIndex } from "../../.././../utils/app-constants";
import { ProjectPostingService } from '../../client-project/components/project-view/project-posting/services/project-posting.service';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vendor-project-main',
    templateUrl: './vendor-project-main.component.html',
    styleUrls: ['./vendor-project-main.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class VendorProjectMainComponent implements OnInit, OnDestroy {

    registerForm: FormGroup;
    uploadedFiles = [];
    userType: number;
    selectedIndex = 0;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _menuService: MenuService,
        private _projPostService: ProjectPostingService

    ) {
        this._unsubscribeAll = new Subject();


        this._projPostService.selectedVendorProjectTab.pipe(takeUntil(this._unsubscribeAll)).subscribe(selectedIndex => {
            if (selectedIndex != null) {
                this.selectedIndex = selectedIndex;
            }
        });
    }


    tabSelectionChanged(event) {
        this.selectedIndex = event.index;
        this._projPostService.selectedVendorProjectTabSubject.next(event.index);
    }

    ngOnInit(): void {
        this._menuService.currentPageSearchBarSubject.next(SearchBarPageIndex.FAVOURITE_PROJECTS);
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
