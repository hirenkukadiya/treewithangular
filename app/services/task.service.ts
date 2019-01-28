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
export class TaskService {
  private tasksUrl = environment.baseUrl + "/task"; // URL to web api local
  private cateUrl = environment.baseUrl + "/category"; // URL to web api local

  //private tasksUrl = "/api/task"; // URL to web api live

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  /** GET tasks from the server */
  getTasks(): Observable<Task[]> {
    const url = `${this.tasksUrl}/all`;
    return this.http.get<Task[]>(url).pipe(
      tap(tasks => this.log("fetched tasks")),
      catchError(this.handleError("getTasks", []))
    );
  }

  /** GET Category from the server */
  getCategory(): Observable<Task[]> {
    const url = `${this.cateUrl}/all`;
    return this.http.get<Task[]>(url).pipe(
      tap(tasks => this.log("fetched category")),
      catchError(this.handleError("getTasks", []))
    );
  }

   /** Delete Task from the server */
  deleteTask(task: Task): Observable<Task[]> {
    const url = `${this.tasksUrl}/delete/${task.taskID}`;
    return this.http.post(url, task, httpOptions).pipe(
      tap(_ => this.log("fetched tasks")),
      catchError(this.handleError<any>("deleteTask"))
    );
  }

  /** POST: add a new task to the server */
  addTask(task: Task,category): Observable<Task> {
    console.log("task ",task);
    console.log("category ",category);
    task['category_id'] = category.category_id;
    //return null;
    const url = `${this.tasksUrl}/create`;
    return this.http.post<Task>(url, task, httpOptions).pipe(
      tap((task: Task) => this.log(`added task w/ id=${task.taskID}`)),
      catchError(this.handleError<Task>("addTask"))
    );
  }

  /** PUT: update the task on the server */
  updateTask(task: Task): Observable<any> {
    const url = `${this.tasksUrl}/update/${task.taskID}`;
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

  /** Log a TaskService message with the MessageService */
  private log(message: string) {
    //console.log("call log function ");
    this.messageService.add(`TaskService: ${message}`);
  }
}
