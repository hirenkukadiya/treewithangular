import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { Router } from "@angular/router";
import * as $ from "jquery";

import { AuthService } from "../services/auth.service";
import { EventEmiterService } from "../services/event.emmiter.service";

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.css"]
})
export class SigninComponent implements OnInit {
  isOpen: boolean;
  signinForm: any;
  phone: string;
  header_text: string;
  button_text: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private _eventEmiter: EventEmiterService
  ) {
    this.isOpen = false;
  }

  ngOnInit() {
    this.header_text = "Sign In";
    this.button_text = "Log In";
    this.createSigninForm();
  }

  createSigninForm() {
    this.signinForm = this.formBuilder.group({
      phone: ["", Validators.required]
    });
  }

  /**
   * Model Show
   * */

  onShow() {
    this.isOpen = true;
    this.header_text = "Sign In";
    this.button_text = "Log In";
    this.resetForm();
  }

  /**
   * Model Hide
   **/
  onHide() {
    this.isOpen = false;
  }

  onHideDocument(event) {
    var target = $(event.target);
    if ($(target).hasClass("overlay")) {
      this.onHide();
    }
  }

  onSignIn() {
    if (this.signinForm.valid) {
      console.log("siginin fron ", this.phone);
      this.authService.guestLogin(this.phone).subscribe(() => {
        console.log("User is logged in");
        this.onHide();
        this._eventEmiter.sendMessage({ user_signin: true });
        this.router.navigateByUrl("");
      });
    } else {
      this.validateAllFormFields(this.signinForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    //{1}
    Object.keys(formGroup.controls).forEach(field => {
      //{2}
      const control = formGroup.get(field); //{3}
      if (control instanceof FormControl) {
        //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        //{5}
        this.validateAllFormFields(control); //{6}
      }
    });
  }

  resetForm() {
    this.phone = "";
    this.signinForm.controls.phone.markAsUntouched({ onlySelf: true });
    this.signinForm.controls.phone.markAsPristine({ onlySelf: true });
  }

  onSignUp() {
    this.header_text = "Sign Up";
    this.button_text = "Sign Up";
    this.resetForm();
  }

  onSignInOpen(){
    this.header_text = "Sign In";
    this.button_text = "Log In";
    this.resetForm();
  }
}
