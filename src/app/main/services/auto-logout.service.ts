import { Injectable } from "@angular/core";
import { Router } from '@angular/router'
import { AuthenticationService } from 'app/_services/authentication.service';
import { FuseNavigationService } from '@condonuity/components/navigation/navigation.service';
const MINUTES_UNITL_AUTO_LOGOUT = 30 // in mins
const CHECK_INTERVAL = 10000 // in ms
const STORE_KEY = 'lastAction';
@Injectable(
  {
    providedIn: 'root'
  }
)
export class AutoLogoutService {
  val: any;
  public getLastAction() {
    return parseInt(localStorage.getItem(STORE_KEY));
  }
  public setLastAction(lastAction: number) {
    localStorage.setItem(STORE_KEY, lastAction.toString());
  }

  constructor(private router: Router,
    private _authService: AuthenticationService,
    private _fuseNavigationService: FuseNavigationService) {
    this.check();
    this.initListener();
    this.initInterval();
    localStorage.setItem(STORE_KEY, Date.now().toString());
  }

  initListener() {
    document.body.addEventListener('click', () => this.reset());
    document.body.addEventListener('mouseover', () => this.reset());
    document.body.addEventListener('mouseout', () => this.reset());
    document.body.addEventListener('keydown', () => this.reset());
    document.body.addEventListener('keyup', () => this.reset());
    document.body.addEventListener('keypress', () => this.reset());
    window.addEventListener("storage", () => this.storageEvt());

  }

  reset() {

    // console.log('date got by using events', Date.now());
    this.setLastAction(Date.now());
    // console.log('store key', localStorage.getItem(STORE_KEY));

  }

  initInterval() {
    setInterval(() => {
      this.check();
    }, CHECK_INTERVAL);
  }

  check() {
    const now = Date.now();
    const timeleft = this.getLastAction() + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    // console.log('difference', diff)
    const isTimeout = diff < 0;

    if (isTimeout) {
      this._authService.logout();
      this.router.navigate(['/auth/login']);
      this._fuseNavigationService.unregister('main-nav');
      localStorage.clear();
    }
  }
  storageEvt() {
    console.log("storage");
    this.val = localStorage.getItem(STORE_KEY);
  }
}
