import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { userdetailsApi } from 'app/global';
import { environment } from 'environments/environment';
import { AlertType } from '../utils/app-enum'

const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

@Injectable({
  providedIn: 'root'
})

export class CommonFunctionsService {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    public snackBar: MatSnackBar,
    private http: HttpClient
    ) { }


  openSnackBar(message: string) {
    this.snackBar.open(message,'x',{
      duration: 8000,
      panelClass: ['error'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  public get rolesData() {
    let roles =[{id:0,name:'User'},{id:1,name:'MUser'},{id:11,name:'Manager'},{id:12,name:'Assistant Manager'},{id:13,name:'Board Manager'}];
    return roles;
  }

  public updatePassword(passwordData) {
    return this.http.post<any>(`${environment.apiUrl}/user/resetPassword`,passwordData,httpOptions);
  }

  static checkUserType(id:number) {
    let userTypeData = id.toString().split('');
    return userTypeData[0];
  }
}
