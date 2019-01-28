import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";

import { environment } from "../../environments/environment";

import { MessageService } from "./message.service";
import { EventEmiterService } from "./event.emmiter.service";

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" })
};

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private authUrl = environment.baseUrl; // URL to web api local
  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private _eventEmiter: EventEmiterService
  ) {}

  login(email: string, password: string) {
    const url = `${this.authUrl}/login`;
    return this.http.post(url, { email, password }, httpOptions).pipe(
      tap(res => this.setSession(res)),
      catchError(this.handleError("getTasks", []))
    );
  }

  guestLogin(phone: string) {
    const url = `${this.authUrl}/login`;
    return this.http.post(url, { phone }).pipe(
      tap(res => this.setSession(res)),
      catchError(this.handleError("getTasks", []))
    );
  }

  private setSession(authResult) {
    localStorage.setItem("id_token", authResult.token);
    localStorage.setItem("is_default", "false");
    localStorage.setItem("user", JSON.stringify(authResult.user));
  }

  logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("is_default");
    localStorage.removeItem("user");
    this.defaultGuestUser();
  }

  public isLoggedIn() {
    const expiration = localStorage.getItem("id_token");
    return expiration != undefined && expiration != null ? true : false;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  public isDefaultUser() {
    const default_a = localStorage.getItem("is_default");
    if (default_a == "true") {
      return true;
    }
    return false;
  }

  public getToken(): string {
    return localStorage.getItem("id_token");
  }

  public isAuthenticate(): boolean {
    if (this.getToken() && !this.isDefaultUser()) {
      return true;
    }
    return false;
  }

  public getUser() {
    var user = localStorage.getItem("user");
    if (!user) {
      return null;
    }
    return JSON.parse(user);
  }

  public defaultGuestUser() {
    if (!this.getToken()) {
      const phone = "1234554321";
      this.guestLogin(phone).subscribe(() => {
        console.log("User is logged in");
        localStorage.setItem("is_default", "true");
        this._eventEmiter.sendMessage({ user_signin: true });
      });
    }
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a AuthService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`AuthService: ${message}`);
  }
}
