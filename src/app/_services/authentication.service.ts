import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConstants, APIResponse, UserType, LoginResponse } from '../utils/app-constants'
import { AppService } from '../../app/main/services/app.service'
import { MenuService } from '../../app/layout/components/toolbar/menu.service'

const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };


@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    public currentUserSubject: BehaviorSubject<any>;
    public corporationSubject: BehaviorSubject<any>;
    public currentCorporationSubject: BehaviorSubject<any>;

    public currentUser: Observable<any>;
    public organisationLists: Observable<any>;
    public activeOrganisation: Observable<any>;


    constructor(
        private http: HttpClient,
        private _appService: AppService,
        private _menuService: MenuService
    ) {
        this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();

        var orgList: any;
        orgList = localStorage.getItem('userOrgs');
        if (orgList != null && orgList != 'undefined') {
            this.corporationSubject = new BehaviorSubject<any>(JSON.parse(orgList));
        } else {
            this.corporationSubject = new BehaviorSubject<any>(null);
        }

        this.organisationLists = this.corporationSubject.asObservable();

        this.currentCorporationSubject = new BehaviorSubject<any>(null);
        this.activeOrganisation = this.currentCorporationSubject.asObservable();
    }

    public get currentUserValue() {
        return this.currentUserSubject.value;
    }


    login(userData) {
        return this.http.post<any>(AppConstants.loginURL, userData, httpOptions)
            .pipe(map(user => {
                if (user.statusCode == APIResponse.Success) {
                    user.userDetails.profileImageUrl = user.userProfileImage;
                    user.userDetails.currentOrgId = user.userDetails.primaryOrgId;
                    this.storeUserAuthInfo(user);
                    this.currentUserSubject.next(user.userDetails);
                }
                return user;
            }));
    }



    // getOrganizationDetails(userDetails) {
    //     if (userDetails.userType == UserType.Client) {
    //         this._appService.getClientOrganisationList(userDetails.clientId).subscribe(orgData => {
    //             if (orgData != null && orgData.statusCode == APIResponse.Success) {
    //                 this.corporationSubject.next(orgData.corporateAccounts);
    //                 this.storeUserOrgList(orgData.corporateAccounts);
    //                 this.currentCorporationSubject.next(orgData.corporateAccounts[0]);
    //             }
    //         });
    //     } else if (userDetails.userType == UserType.Vendor) {
    //         this._appService.getVendorOrgProfileDetails(userDetails.userId).subscribe(orgDetails => {
    //             this.corporationSubject.next(orgDetails.vendor);
    //             this.storeUserOrgList(orgDetails.vendor);

    //         });
    //     }
    // }

    setCurrentUserOrg(org) {
        if (this.currentUserSubject.value != null) {
            let user = this.currentUserSubject.value;
            user.currentOrgId = org.clientOrganisationId;
            this.storeClientOrgInfo(user);
            this.currentUserSubject.next(user);
        }
    }


    // getClientOrgDetails(clientId) {
    //     return this._appService.getClientOrganisationList(clientId);

    //     if (userDetails.userType == UserType.SupportUser) {
    //         return user;
    //     } else {
    //         this.getOrganisationData();
    //         if (userDetails.userType == UserType.Client) {
    //             this.fetchOrganisation(user.userDetails).subscribe(
    //                 currentOrg => {
    //                     if (currentOrg.valuecorporateAccounts) {
    //                         this.corporationSubject.next(currentOrg.valuecorporateAccounts.organisationList)
    //                     }
    //                 }
    //             );
    //             return user;
    //         } else if (user.userDetails.userType == UserType.Vendor) {
    //             this.corporationSubject.next(user.vendor);
    //             return user;
    //         }
    //     }
    // } else {
    //     return null;
    // }
    // }



    // getOrganisationData() {
    //     if (this.currentUserSubject.value) {
    //         this.fetchOrganisation(this.currentUserSubject.value).subscribe(
    //             orgData => {
    //                 if (orgData) {
    //                     let userType = Number(CommonFunctionsService.checkUserType(this.currentUserSubject.value.userType));
    //                     if (userType == UserType.Client) {
    //                         this.corporationSubject.next(orgData.corporateAccounts);
    //                         this.currentCorporationSubject.next(orgData.corporateAccounts[0])
    //                     } else if (this.currentUserSubject.value.userType == UserType.Vendor) {
    //                         this.corporationSubject.next(orgData.vendor);
    //                     }
    //                     this.getDefaultOrganization(orgData.corporateAccounts);
    //                 }
    //             }
    //         );
    //     }
    // }

    // getDefaultOrganization(coporateAccounts) {
    //     //Write a logic to get the default account details
    //     this._menuService.currentCorporationSubject.next(coporateAccounts[0]);
    // }

    // fetchOrganisation(userDetails) {
    //     let userType = Number(userDetails.userType);
    //     if (userType == UserType.Client) {
    //         return this._appService.getClientOrganisationList(userDetails.clientId);
    //     } else if (userDetails.userType == UserType.Vendor) {
    //         return this.http.get<any>(`${userdetailsApi}/vendor/${userDetails.vendorId}`, httpOptions);
    //     }
    // }


    getAuthToken(userName: String, password: String) {
        let postBody = {
            'username': userName,
            'password': password
        }
        const header = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.post<any>(AppConstants.authTokenURL, postBody, { headers: header });
    }

    storeUserAuthInfo(user) {
        localStorage.setItem('currentUser', JSON.stringify(user.userDetails));
        localStorage.setItem('authToken', user.authToken);
    }

    storeUserOrgList(userOrgs) {
        localStorage.setItem('userOrgs', JSON.stringify(userOrgs));
    }

    storeClientOrgInfo(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userOrgs');
        this.currentUserSubject.next(null);
    }
}
