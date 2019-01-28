import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import * as $ from "jquery";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit {
  isOpen: boolean;
  signupForm: any;
  phone: string;

  constructor(private formBuilder: FormBuilder) {
    this.isOpen = false;
    this.createSignupForm();
  }

  ngOnInit() {}

  createSignupForm() {
    this.signupForm = this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", Validators.required],
      phone: ["", Validators.required],
      password: ["", Validators.required],
      confirm_password: ["", Validators.required]
    });
  }

  /**
   * Model Show
   * */

  onShow() {
    this.isOpen = true;
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

  onSignIn() {}
}
