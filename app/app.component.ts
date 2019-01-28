import { Component, ViewChild, NgZone } from "@angular/core";
import { Router } from "@angular/router";

import { SignupComponent } from "./signup/signup.component";
import { SigninComponent } from "./signin/signin.component";
import { EventEmiterService } from "./services/event.emmiter.service";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  @ViewChild(SignupComponent) signup: SignupComponent;
  @ViewChild(SigninComponent) signin: SigninComponent;
  title = "Time Bot";
  user = null;
  phone: string;

  constructor(
    private _eventEmiter: EventEmiterService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this._eventEmiter.dataStr.subscribe(data => {
      this.getEventResponse(data);
    });
    this.authService.defaultGuestUser();
    this.user = this.authService.getUser();
    this.getUserPhone();
  }

  openSignUpModel() {
    this.signup.onShow();
  }

  openSignInModel() {
    this.signin.onShow();
  }

  onSignOut() {
    this.authService.logout();
    this._eventEmiter.sendMessage({ user_signout: true });
    this.router.navigateByUrl("");
  }

  isloginUser(): boolean {
    return this.authService.isAuthenticate();
  }

  getEventResponse(data) {
    if (data.signin != undefined && data.signin == true) {
      this.openSignInModel();
    }
    this.user = this.authService.getUser();
    this.getUserPhone();
  }

  getUserPhone() {
    if (
      this.user != null &&
      this.user.phone != undefined &&
      this.user.phone != "1111111111"
    ) {
      this.ngZone.run(() => {
        this.phone = this.user.phone;
      });
    } else {
      this.ngZone.run(() => {
        this.phone = "User";
      });
    }
    console.log("this.phone ", this.phone);
  }
}
