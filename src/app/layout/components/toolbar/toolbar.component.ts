import { Component, OnDestroy, OnInit, ViewEncapsulation, Inject, ElementRef, ViewChild } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, filter, startWith, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FuseConfigService } from '@condonuity/services/config.service';
import { FuseSidebarService } from '@condonuity/components/sidebar/sidebar.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { AuthenticationService } from 'app/_services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FuseNavigationService } from '@condonuity/components/navigation/navigation.service';
import { Location } from '@angular/common';
import { NavigationMonitorService } from 'app/_services/navigation-monitor.service';
import { MenuService } from '../../components/toolbar/menu.service'
import { ClientUserRole, SearchBarPageIndex, APIResponse, AlertType, AppLiterals, AppDateFormat, UserType, AmenityID, UserEnrollmentStatus, MaxFileSize } from 'app/utils/app-constants';
import { AppService } from 'app/main/services/app.service';
import { AppUtilService } from 'app/utils/app-util.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Notification } from '../toolbar/model/notification.model'
import * as moment from 'moment';
import { SearchService } from './service/search.service';
import { HostListener } from '@angular/core';
import { Amenity } from 'app/main/registration/model/amenity.model';
import { CityProvince } from 'app/main/registration/model/city-province.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationDialogComponent, DialogType } from 'app/main/Shared/confirmation-dialog/confirmation-dialog.component';


export interface DialogData {
    userData: any;
    notifications: any;
}

@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})


export class ToolbarComponent implements OnInit, OnDestroy {

    searchForm: FormGroup;

    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: any;
    navigation: any;
    selectedLanguage: any;
    userStatusOptions: any[];
    currentpage: string;
    organizationList = [];

    userName: string;
    userRole: string;
    currentOrg: any;

    currentSearchBarIndex: number;
    searchBarPlaceholderText = 'Search';

    notifications: Notification[];
    latestNotifications: Notification[];

    searchInput;
    searchField;

    isSerechBarVisiable = true;
    profileImageUrl: string;

    unreadMessagesCount: 0;

    externalHelpLink = 'https://condonuitystaticdev.z13.web.core.windows.net/faq.html';


    // Private
    private _unsubscribeAll: Subject<any>;
    currentUser: any;
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        public router: Router,
        private _authService: AuthenticationService,
        private _fuseNavigationService: FuseNavigationService,
        private location: Location,
        private _navMonitor: NavigationMonitorService,
        private _menuService: MenuService,
        public dialog: MatDialog,
        private _appService: AppService,
        private _appUtil: AppUtilService,
        private _formBuilder: FormBuilder,
        private _searchService: SearchService
    ) {
        this._unsubscribeAll = new Subject();

        this._authService.currentUser.pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
            this.currentUser = x;
            this.profileImageUrl = this.currentUser.profileImageUrl;
            if (this.currentUser.lastName != null && this.currentUser.firstName != '') {
                this.userName = this.currentUser.lastName + ' ' + this.currentUser.firstName;
            } else {
                this.userName = "Guest User";
            }
            if (this.currentUser.userType == UserType.Vendor) {
                this.getVendorNotifications(this.currentUser.vendorOrganisationId, this.currentUser.userId);
            } else if (this.currentUser.userType == UserType.Client) {
                this.getClientNotifications(this.currentUser.currentOrgId, this.currentUser.clientId);
            }
        });

        this.userStatusOptions = [
            {
                title: 'Online',
                icon: 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon: 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon: 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.languages = [
            {
                id: 'en',
                title: 'English',
                flag: 'us'
            },
            {
                id: 'tr',
                title: 'Turkish',
                flag: 'tr'
            }
        ];

        this._unsubscribeAll = new Subject();
        this._navMonitor.getNavigationTitle
            .subscribe((result) => {
                this.currentpage = result;
            });

        this.searchForm = this._formBuilder.group({
            searchInput: ['']
        });
    }

    notificationClicked() {
        if (this.currentUser.userType == UserType.Vendor) {
            this.getVendorNotifications(this.currentUser.vendorOrganisationId, this.currentUser.userId);
            this.resetUnreadVendorNotificationCount(this.currentUser.vendorOrganisationId, this.currentUser.userId);
        } else {
            this.getClientNotifications(this.currentUser.currentOrgId, this.currentUser.clientId);
            this.resetUnreadClientNotificationCount(this.currentUser.currentOrgId, this.currentUser.clientId);
        }
    }


    onSelectOrganization(org) {
        this._authService.setCurrentUserOrg(org);
        this._menuService.currentCorporationSubject.next(org)
    }

    logout() {
        this._authService.logout();
        this.router.navigate(['/auth/login']);
        this._fuseNavigationService.unregister('main-nav');
    }

    initializePageName(navigation) {
        let pathData = this.location.path();
        let navData = navigation;
        pathData = pathData.substring(1);
        let currentNav = navData.find(data => data.url == pathData);
        if (currentNav) {
            this.currentpage = currentNav.title;
        }
    }
    @HostListener('window:popstate', ['$event'])
    onPopState() {
        this.initializePageName(this.navigation)
    }
    openNotificationDialog() {
        const userNewRef = this.dialog.open(NotificationDialog, { data: { userData: this.currentUser, notifications: this.notifications } });
    }

    openAddClientDialog() {
        const userNewRef = this.dialog.open(AddClientDialog, { data: { userData: this.currentUser, notifications: this.notifications }, width: '80%', height: 'auto' });
    }

    ngOnInit(): void {
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        this.selectedLanguage = _.find(this.languages, { id: this._translateService.currentLang });

        this._fuseNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._fuseNavigationService.getCurrentNavigation();
                this.initializePageName(this.navigation)
            });

        this._authService.organisationLists.pipe(takeUntil(this._unsubscribeAll)).subscribe(orgList => {
            if (this.currentUser.userType == UserType.Client) {
                if (orgList != null && orgList.length > 0) {
                    this.organizationList = orgList;
                    this.setDefaultOrg();
                }
            } else if (this.currentUser.userType == UserType.Vendor) {
                this.currentOrg = orgList;
            }
        });


        this._menuService.searchBarIndexForCurrentPage.pipe(takeUntil(this._unsubscribeAll)).subscribe(searchBarIndex => {
            if (searchBarIndex != null) {
                this.currentSearchBarIndex = searchBarIndex;
                this.configureSearchBar();
            }
        });

        this._menuService.selectedOrganization.pipe(takeUntil(this._unsubscribeAll)).subscribe(org => {
            debugger;
            if (org != null) {
                this.currentOrg = org;
                if (this.currentUser.userType == UserType.Client) {
                    this.getClientNotifications(this.currentUser.currentOrgId, this.currentUser.clientId);
                }
            }
        });
    }


    configureSearchBar() {

        this.searchForm.controls['searchInput'].setValue('');
        this.isSerechBarVisiable = true;

        switch (this.currentSearchBarIndex) {

            case SearchBarPageIndex.CONTRACTS: {
                this.searchBarPlaceholderText = 'Search contracts';
                break;
            }
            case SearchBarPageIndex.BROWSE_CONDOS: {
                this.searchBarPlaceholderText = 'Search condos';
                break;
            }
            case SearchBarPageIndex.BROWSE_VENDORS: {
                this.searchBarPlaceholderText = 'Search contractors';
                break;
            }
            case SearchBarPageIndex.BUILDING_REPOSITORY: {
                this.searchBarPlaceholderText = 'Search building repository';
                break;
            }
            case SearchBarPageIndex.MARKETPLACE_PROJECTS: {
                this.searchBarPlaceholderText = 'Search marketplace projects';
                break;
            }
            case SearchBarPageIndex.CURRENT_PROJECTS: {
                this.searchBarPlaceholderText = 'Search current projects';
                break;
            }

            case SearchBarPageIndex.HISTORY_PROJECTS: {
                this.searchBarPlaceholderText = 'Search project history';
                break;
            }

            case SearchBarPageIndex.FAVOURITE_PROJECTS: {
                this.searchBarPlaceholderText = 'Search favorite project';
                break;
            }

            case SearchBarPageIndex.REVIEWS: {
                this.searchBarPlaceholderText = 'Search reviews';
                break;
            }
            case SearchBarPageIndex.TASKS: {
                this.searchBarPlaceholderText = 'Search tasks';
                break;
            }

            case SearchBarPageIndex.INTERNAL_MESSAGES: {
                this.searchBarPlaceholderText = 'Search internal messages';
                break;
            }

            case SearchBarPageIndex.EXTERNAL_MESSAGES: {
                this.searchBarPlaceholderText = 'Search external messages';
                break;
            }

            case SearchBarPageIndex.OTHERS: {
                this.searchBarPlaceholderText = '';
                this.isSerechBarVisiable = false;
                break;
            }
        }
    }


    setDefaultOrg() {
        this.currentOrg = this.organizationList.find(org => org.isPrimary == 'true');
        if (this.currentOrg == null) {
            this.currentOrg = this.organizationList[0];
        }

        if (this.currentOrg.clientUserType == ClientUserRole.AssistantManager) {
            this.userRole = "Assistant Manager";
        } else if (this.currentOrg.clientUserType == ClientUserRole.BoardMember) {
            this.userRole = "Board Member";
        } else {
            this.userRole = "Manager";
        }
    }


    getClientNotifications(clientOrgId, clientUserId) {
        this._appService.getClientNotifications(clientOrgId, clientUserId).subscribe((response: any) => {
            if (response.statusCode == APIResponse.Success) {
                this.notifications = response.notifications.map(notification => {
                    if (notification.createdAt != null) {
                        var localTime = moment.utc(notification.createdAt).toDate();
                        notification.notificationDate = moment(localTime).format(AppDateFormat.DisplayFormat);
                    } else {
                        notification.notificationDate = 'NA';
                    }
                    if (notification.notificationCategoryType == 4 || notification.notificationCategoryType == 31) {
                        notification.fromUserName = '';
                    } else {
                        notification.fromUserName = notification.senderFirstName + ' ' + notification.senderLastName;
                    }

                    return notification;
                });

                this.unreadMessagesCount = response.unreadMessagesCount;
                this.getLatestNotifications();
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.newMessageCreationSuccess);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }



    getVendorNotifications(clientOrgId, clientUserId) {
        this._appService.getVendorNotifications(clientOrgId, clientUserId).subscribe((response: any) => {
            if (response.statusCode == APIResponse.Success) {
                this.notifications = response.notifications.map(notification => {
                    if (notification.createdAt != null) {
                        var localTime = moment.utc(notification.createdAt).toDate();
                        notification.notificationDate = moment(localTime).format(AppDateFormat.DisplayFormat);
                    } else {
                        notification.notificationDate = 'NA';
                    }

                    if (notification.notificationCategoryType == '4' || notification.notificationCategoryType == '31') {
                        notification.fromUserName = '';
                    } else {
                        notification.fromUserName = notification.senderFirstName + ' ' + notification.senderLastName;
                    }
                    return notification;
                });
                this.unreadMessagesCount = response.unreadMessagesCount;
                this.getLatestNotifications();
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.newMessageCreationSuccess);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    getLatestNotifications() {
        this.notifications.sort((a, b) => { return <any>new Date(b.createdAt) - <any>new Date(a.createdAt) });
        this.latestNotifications = [];
        if (this.notifications.length <= 5) {
            this.latestNotifications = this.notifications;
        } else {
            for (let i = 0; i < 5; i++) {
                this.latestNotifications.push(this.notifications[i])
            }
        }
    }

    resetUnreadClientNotificationCount(clientOrgId, clientUserId) {
        debugger;
        this._appService.resetClientNotifications(clientOrgId, clientUserId).subscribe((response: any) => {
            if (response.statusCode == APIResponse.Success) {
                this.unreadMessagesCount = 0;
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    resetUnreadVendorNotificationCount(vendorOrgId, vendorUserId) {
        this._appService.resetVendorNotifications(vendorOrgId, vendorUserId).subscribe((response: any) => {
            if (response.statusCode == APIResponse.Success) {
                this.unreadMessagesCount = 0;
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    navigateToHelpLink() {
        window.open(this.externalHelpLink, "_blank");
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }


    search(searchText): void {
        var searchDetails: any;
        if (this.currentUser.userType == UserType.Client) {
            searchDetails = {
                "searchType": this.currentSearchBarIndex,
                "keyword": searchText,
                "clientUserId": this.currentUser.clientId,
                "clientOrganisationId": this.currentUser.currentOrgId
            }
            this.perfromClientSearch(searchDetails);
        } else if (this.currentUser.userType == UserType.Vendor) {
            searchDetails = {
                "searchType": this.currentSearchBarIndex,
                "keyword": searchText,
                "vendorUserId": this.currentUser.userId,
                "vendorOrganisationId": this.currentUser.vendorOrganisationId
            }
            this.perfromVendorSearch(searchDetails);
        }
    }

    perfromVendorSearch(searchDetails) {
        this._appService.triggerVendorSearch(searchDetails).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.respondWithSearchRestult(response);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToRetreiveMessages);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }

    perfromClientSearch(searchDetails) {
        this._appService.triggerClientSearch(searchDetails).subscribe((response) => {
            if (response.statusCode == APIResponse.Success) {
                this.respondWithSearchRestult(response);
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.unableToRetreiveMessages);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
        });
    }


    respondWithSearchRestult(response) {
        switch (this.currentSearchBarIndex) {
            case SearchBarPageIndex.CONTRACTS: {
                this._searchService.contractsSearchSubject.next(response.results);
                break;
            }
            case SearchBarPageIndex.BROWSE_CONDOS: {
                this._searchService.browseCondosSearchSubject.next(response.results);
                break;
            }
            case SearchBarPageIndex.BROWSE_VENDORS: {
                this._searchService.browseVendorsSearchSubject.next(response.results);
                break;
            }
            case SearchBarPageIndex.BUILDING_REPOSITORY: {
                this._searchService.buildingRepoSearchSubject.next(response.results);
                break;
            }
            case SearchBarPageIndex.MARKETPLACE_PROJECTS: {
                this._searchService.marketPlaceProjectsSearchSubject.next(response.results);
                break;
            }
            case SearchBarPageIndex.CURRENT_PROJECTS: {
                this._searchService.currentProjectsSearchSubject.next(response.results);
                break;
            }

            case SearchBarPageIndex.HISTORY_PROJECTS: {
                this._searchService.historyProjectsSearchSubject.next(response.results);
                break;
            }

            case SearchBarPageIndex.FAVOURITE_PROJECTS: {
                this._searchService.favoriteProjectsSearchSubject.next(response.results);
                break;
            }

            case SearchBarPageIndex.REVIEWS: {
                this._searchService.reviewsSearchSubject.next(response.results);
                break;
            }
            case SearchBarPageIndex.TASKS: {
                this._searchService.tasksSearchSubject.next(response.results);
                break;
            }
            case SearchBarPageIndex.INTERNAL_MESSAGES: {
                this._searchService.internalMessagesSearchSubject.next(response.results);
                break;
            }

            case SearchBarPageIndex.EXTERNAL_MESSAGES: {
                this._searchService.externalMessagesSearchSubject.next(response.results);
                break;
            }
        }
    }


    clearSearchField(event) {
        if (event.type == 'click') {
            this.searchForm.controls['searchInput'].setValue('');
            this._searchService.clearSearchSubject.next(this.currentSearchBarIndex);
        }
    }

    setLanguage(lang): void {
        this.selectedLanguage = lang;
        this._translateService.use(lang.id);
    }
}


@Component({
    selector: 'notification-dialog',
    templateUrl: 'notification-dialog.html',
})


export class NotificationDialog {

    currentUser: any;
    notifications: any;
    constructor(
        private _appUtil: AppUtilService,
        private _appService: AppService,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<NotificationDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.currentUser = data.userData;
        this.notifications = data.notifications;
    }
}




@Component({
    selector: 'add-client-dialog',
    templateUrl: 'add-client-dialog.html',
})

export class AddClientDialog {

    @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

    @ViewChild('fileInput', { static: false }) fileInput: ElementRef<HTMLInputElement>;

    maxRegDate = new Date();

    corpInfoForm: FormGroup;
    otherInfoForm: FormGroup;
    aminitiesInfoForm: FormGroup;

    mandatory = "Mandatory field is required";
    uploadedFiles = [];
    spot = { ug: true, gl: true };

    amenitiesDetails = {};
    userId: any;

    imgURL: any;
    profileImageFile: File;
    docFileList: File[] = [];

    amenityList: Amenity[];
    cityProvinceList: CityProvince[] = [];
    cityList: String[] = [];

    selectedCityPro: CityProvince;
    userRegistrationMetaData: any;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    tagCtrl = new FormControl();
    filteredAmenities: Observable<Amenity[]>;
    selectedAmenities: Amenity[] = [];

    currentUser: any;
    notifications: any;

    constructor(
        public dialog: MatDialog,
        private _appUtil: AppUtilService,
        private _appService: AppService,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<NotificationDialog>,
        private _cookieService: CookieService,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.getAppData();

        this.currentUser = data.userData;
        this.notifications = data.notifications;

        this.corpInfoForm = this._formBuilder.group({
            corpName: ['', Validators.required],
            corpNumber: ['', Validators.required],
            address: ['', Validators.required],
            city: ['', Validators.required],
            province: ['', Validators.required],
            postalCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9].{3,5}$')]],
            phoneNumber: ['', [Validators.required, Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')]],
            fax: ['', Validators.pattern('^[0-9]*$')],
            generalMail: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
            managementMail: ['', [Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
            boardMail: ['', [Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
            docUploader: ['', Validators.required]
        });


        this.otherInfoForm = this._formBuilder.group({
            unitsNos: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            votingUnits: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
            registerDate: ['', Validators.required],
            managementCompany: ['', Validators.required],
            managerName: [''],
            managerEmail: ['', Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
            managerPhone: ['', Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$')],

        });

        this.aminitiesInfoForm = this._formBuilder.group({
            amenity: ['']
        });
    }

    fileEvent(files) {
        if (AppUtilService.checkMaxFileSize(files, MaxFileSize.TWOMB)) {
            var mimeType = files[0].type;
            if (mimeType.match(/image\/*/) == null) {
                return;
            }

            var reader = new FileReader();
            this.profileImageFile = files[0];
            reader.readAsDataURL(files[0]);
            reader.onload = (_event) => {
                this.imgURL = reader.result;
            }
        } else {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError2MB);
        }
    }

    appendDocumentFiles(event) {
        let files = event.target.files;
        if (AppUtilService.checkMaxFileSize(files, MaxFileSize.FIVEMB)) {
            if (this.docFileList == null) {
                this.docFileList = [];
            }

            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                file.formatedSize = AppUtilService.formatSizeUnits(file.size);
                this.docFileList.push(file)
            }
        } else {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.FilesizeError5MB);
        }
    }

    removeDocAttachment(index) {
        this.docFileList.splice(index, 1);
        if (this.docFileList.length == 0) {
            this.fileInput.nativeElement.value = null;
        }
        // this.fileInput.nativeElement.value = '';
    }

    citySelected(cityInfo) {
        this.selectedCityPro = cityInfo;
        this.corpInfoForm.get('province').setValue(cityInfo.province);
    }

    private _filter(value): Amenity[] {
        let return_value: any;
        if (this.amenityList.includes(value)) {
            return_value = this.amenityList.filter((data: Amenity) => data.amenitiesName.toLowerCase().indexOf(value) !== -1);
            this.selectedHandle(value);
        } else {
            const filterValue = value.toLowerCase();
            return_value = this.amenityList.filter((data: Amenity) => data.amenitiesName.toLowerCase().indexOf(filterValue) !== -1);
        }
        return return_value;
    }

    private selectedHandle(value: Amenity) {
        let index = this.amenityList.indexOf(value)
        this.amenityList.splice(index, 1);
        this.amenityList.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));
        this.aminitiesInfoForm.get('amenity').setValue(this.selectedAmenities);
        this.tagInput.nativeElement.blur();
        this.tagInput.nativeElement.focus();
    }

    remove(data: Amenity): void {
        const index = this.selectedAmenities.indexOf(data);
        if (index >= 0) {
            this.selectedAmenities.splice(index, 1);
            this.amenityList.push(data);
            this.amenityList.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));
            this.tagCtrl.setValue(null);
            this.aminitiesInfoForm.get('amenity').setValue(this.selectedAmenities);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.selectedAmenities.push(event.option.value);
        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
        this.tagInput.nativeElement.blur();
        this.tagInput.nativeElement.focus();
    }


    registerClientOrganisation() {
        if (this.aminitiesInfoForm.valid && this.corpInfoForm.valid && this.otherInfoForm.valid) {
            let aminitiesDeatilsList = this.selectedAmenities.map((aminity: Amenity) => {
                return {
                    'amenityId': aminity.id
                }
            });

            let regDate = 'YYYY-MM-DD';
            let createdDate = moment(this.otherInfoForm.value['registerDate']);
            if (createdDate.isValid()) {
                regDate = moment(createdDate).format('YYYY-MM-DD');
            }

            let organisationDetails = {
                "clientAmenities": aminitiesDeatilsList,
                "address": this.corpInfoForm.value['address'],
                "boardEmail": this.corpInfoForm.value['boardMail'],
                "city": this.selectedCityPro.id,
                "province": this.selectedCityPro.province,
                "corporateNumber": this.corpInfoForm.value['corpNumber'],
                "countryCode": this.corpInfoForm.value['postalCode'],
                "faxNumber": this.corpInfoForm.value['fax'],
                "generalEmail": this.corpInfoForm.value['generalMail'],
                "managementEmail": this.corpInfoForm.value['managementMail'],
                "phoneNumber": this.corpInfoForm.value['phoneNumber'],
                "postalCode": this.corpInfoForm.value['postalCode'],
                "organisationName": this.corpInfoForm.value['corpName'],

                "managementCompany": this.otherInfoForm.value['managementCompany'],
                "managerEmail": this.otherInfoForm.value['managerEmail'],
                "managerName": this.otherInfoForm.value['managerName'],
                "managerPhone": this.otherInfoForm.value['managerPhone'],
                "registrationDate": regDate,
                "units": this.otherInfoForm.value['unitsNos'],
                "votingUnits": this.otherInfoForm.value['votingUnits'],
                "userType": UserType.Client
            };

            this._appService.registerNewClientOrgFromApp(organisationDetails, this.currentUser.clientId).subscribe((res: any) => {
                if (res.statusCode == APIResponse.Success) {
                    this.checkAndUploadFiles(res.clientOrganisationId, res.clientId);
                } else if (res.statusCode == UserEnrollmentStatus.AlreadyExist) {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.condoCorpNameExistAlready);
                } else if (res.statusCode == UserEnrollmentStatus.ReachedMaxiumCount) { //Corp# alreay exists
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.condoCorpNoExistAlready);
                } else {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                }
            },
                err => {
                    this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
                });
        }
    }

    checkAndUploadFiles(clientOrgId, clientUserId) {
        if (this.profileImageFile != null) {
            this.uploadClientProfileImage(clientOrgId, clientUserId);
        } else if (this.docFileList != null && this.docFileList.length > 0) {
            this.uploadClientSupportingFiles(clientOrgId, clientUserId);
        } else {
            this._appUtil.showAlert(AlertType.Success, AppLiterals.userRegistrationSuccessful);
        }
    }

    uploadClientProfileImage(clientOrgId, clientUserId) {
        this._appService.uploadClientOrgProfileImage(this.profileImageFile, clientOrgId).subscribe((response: any) => {
            if (response.statusCode == APIResponse.Success) {
                if (this.docFileList != null && this.docFileList.length > 0) {
                    this.uploadClientSupportingFiles(clientOrgId, clientUserId);
                } else {
                    this._appUtil.showAlert(AlertType.Success, AppLiterals.userRegistrationSuccessful);
                }
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        }, err => {
            this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            console.log(err);
        });
    }

    uploadClientSupportingFiles(clientOrgId, clientUserId) {
        let successCount = 0;
        this.docFileList.forEach(file => {
            this._appService.uploadClientOrgRegistrationSupportFiles(file, clientOrgId, clientUserId).subscribe((response: any) => {
                if (response.statusCode == APIResponse.Success) {
                    successCount = successCount + 1;
                    if (successCount == this.docFileList.length) {
                        this.showRegistrationSuccessDialog()
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

    showRegistrationSuccessDialog() {
        const userNewRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '550px', data: {
                type: DialogType.OneButtonDialog,
                title: "SUCCESS",
                message: AppLiterals.condoRegistrationSuccessful,
                yesButtonTitle: "OK"
            }
        });
        userNewRef.afterClosed().subscribe(result => {
            if (result != undefined && result != '') {
                this.dialogRef.close(true);
            }
        });
    }


    getAppData() {
        this._appService.getAppData().subscribe((res: any) => {
            if (res.statusCode == APIResponse.Success) {
                this.amenityList = res.amenities.map(aminity => {
                    switch (aminity.id) {
                        case AmenityID.PartyRoom: {
                            aminity.imageSource = 'assets/images/i-party.png';
                            break;
                        }
                        case AmenityID.Gym: {
                            aminity.imageSource = 'assets/images/i-gym.png';
                            break;
                        }
                        case AmenityID.PoolIndoor: {
                            aminity.imageSource = 'assets/images/i-swimming.png';
                            break;
                        }
                        case AmenityID.PoolOutdoor: {
                            aminity.imageSource = 'assets/images/i-swimming.png';
                            break;
                        }
                        case AmenityID.ParkingIndoor: {
                            aminity.imageSource = 'assets/images/i-car.png';
                            break;
                        }
                        case AmenityID.ParkingOutdoor: {
                            aminity.imageSource = 'assets/images/i-car.png';
                            break;
                        }
                        case AmenityID.SecurityDesk: {
                            aminity.imageSource = 'assets/images/i-security.png';
                            break;
                        }
                        case AmenityID.SecurityCamera: {
                            aminity.imageSource = 'assets/images/i-camera.png';
                            break;
                        }
                        case AmenityID.BusinessCenter: {
                            aminity.imageSource = 'assets/images/i-business.png';
                            break;
                        }
                        case AmenityID.GuestRoom: {
                            aminity.imageSource = 'assets/images/i-guest.png';
                            break;
                        }
                        case AmenityID.MediaRoom: {
                            aminity.imageSource = 'assets/images/i-media.png';
                            break;
                        }
                        case AmenityID.TennisCourt: {
                            aminity.imageSource = 'assets/images/i-tennis.png';
                            break;
                        }
                        case AmenityID.ValleyBallCourt: {
                            aminity.imageSource = 'assets/images/i-volleyball.png';
                            break;
                        }
                        case AmenityID.OutdoorBBQ: {
                            aminity.imageSource = 'assets/images/i-bbq.png';
                            break;
                        }
                        case AmenityID.RooftopDeck: {
                            aminity.imageSource = 'assets/images/i-rooftop.png';
                            break;
                        }
                        case AmenityID.GardenPatio: {
                            aminity.imageSource = 'assets/images/i-garden.png';
                            break;
                        }
                        case AmenityID.BasketCourt: {
                            aminity.imageSource = 'assets/images/i-basket.png';
                            break;
                        }
                        case AmenityID.SquashCourt: {
                            aminity.imageSource = 'assets/images/i-squash.png';
                            break;
                        }
                        case AmenityID.Jacuzzi: {
                            aminity.imageSource = 'assets/images/i-faz.png';
                            break;
                        }
                        case AmenityID.Sauna: {
                            aminity.imageSource = 'assets/images/i-sauna.png';
                            break;
                        }
                        case AmenityID.Elevator: {
                            aminity.imageSource = 'assets/images/i-elevator.png';
                            break;
                        }
                        case AmenityID.Other: {
                            aminity.imageSource = 'assets/images/i-security.png';
                            break;
                        }
                    }
                    return aminity;
                });

                this.amenityList.sort((a, b) => a.amenitiesName.localeCompare(b.amenitiesName));

                let provinceList = res.serviceProvinceCities;
                provinceList.forEach(province => {
                    console.log(province);
                    let keys = Object.keys(province);

                    let cityList = province[keys[0]];
                    cityList.forEach(cityDetails => {
                        let cityProvince = new CityProvince();
                        cityProvince.city = cityDetails.cityName;
                        cityProvince.id = cityDetails.id;
                        cityProvince.province = keys[0];
                        this.cityList.push(cityDetails.cityName);
                        this.cityProvinceList.push(cityProvince);
                    });
                });

                this.cityProvinceList.sort((a, b) => a.city.localeCompare(b.city));

                this.filteredAmenities = this.tagCtrl.valueChanges.pipe(
                    startWith(null),
                    map((data: Amenity | null) => data ? this._filter(data) : this.amenityList.slice()));
            } else {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            }
        },
            err => {
                this._appUtil.showAlert(AlertType.Error, AppLiterals.commonNetworkErrorMessage);
            });
    }

    clearRegisterData() {
        this._cookieService.deleteAll();
        localStorage.clear();
    }

}
