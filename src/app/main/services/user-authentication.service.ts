import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import  { AppConstants } from '../../utils/app-constants';
import { CommonFunctionsService } from '../../_services/common-functions.service';


@Injectable({
  providedIn: 'root'
})
export class UserAuthenticationService {

  constructor(private http: HttpClient,
    ) { 

  }

  
  checkUserMail(emailData:string) {
     const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
        return this.http.get<any>(`${AppConstants.verifyEmailURL}${emailData}`,httpOptions);
  }

  checkVendorMail(emailData:string) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
    let body = {
      "email": emailData
    }
    return this.http.post(`${AppConstants.vendorUserRegisterationURL}`,body,httpOptions);
 }

 checkClientMail(emailData:string) {
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'}) };
  let body = {
    "email": emailData
  }
  return this.http.post(`${AppConstants.clientUserRegisterationURL}`,body,httpOptions);
}

  addUser(clientData) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    let userType = Number(CommonFunctionsService.checkUserType(clientData.userType));

    if(userType == 1) {
    return this.http.post<any>(`${environment.apiUrl}/client/addClient`,clientData,httpOptions);
   } else if(clientData.userType == 2){
    return this.http.post<any>(`${environment.apiUrl}/vendor/user/create`,clientData,httpOptions);
   }
  }
}
