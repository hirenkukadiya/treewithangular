import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";

import { environment } from "../../environments/environment";

import { Task } from "../task";
import { Category } from "../category";
import { MessageService } from "./message.service";

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" })
};

@Injectable({
  providedIn: "root"
})
export class CategoryService {
   private CateUrl = environment.baseUrl + "/category"; // URL to web api local
  //private tasksUrl = "/api/task"; // URL to web api live

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

   /** POST: add a new task to the server */
  addTask(task: Task): Observable<Task> {
    console.log("Category Name ",task);
    const url = `${this.CateUrl}/create`;
    return this.http.post<Task>(url, task, httpOptions).pipe(
      tap((task: Task) => this.log(`added task w/ id=${task.taskID}`)),
      catchError(this.handleError<Task>("addTask"))
    );
  }
  /** PUT: update the task on the server */
  updateTask(task: Task): Observable<any> {
    const url = `${this.CateUrl}/update/${task.taskID}`;
    const input = { task: task };
    return this.http.put(url, input, httpOptions).pipe(
      tap(_ => this.log(`updated task id=${task.taskID}`)),
      catchError(this.handleError<any>("updateTask"))
    );
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

   /** GET Service from the server */
  getCategory(): Observable<Category[]> {
    const url = `${this.CateUrl}/all`;
    return this.http.get<Category[]>(url).pipe(
      tap(tasks => this.log("fetched tasks")),
      catchError(this.handleError("getCategory", []))
    );
  }

  /** Delete Category */
   deletecate(category: Category): Observable<Category[]> {
    console.log('task', category);
    const url = `${this.CateUrl}/delete/${category.categoryID}`;
    return this.http.post(url, category, httpOptions).pipe(
      tap(_ => this.log("fetched tasks")),
      catchError(this.handleError<any>("deletecate"))
    );
  }


  /** Log a TaskService message with the MessageService */
  private log(message: string) {
    console.log("call log function ");
    this.messageService.add(`TaskService: ${message}`);
  }
}
