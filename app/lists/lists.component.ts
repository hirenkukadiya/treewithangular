import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";

import { OrderBy } from "../util/orderBy.pipe";
import { Task } from "../task";
import { TaskService } from "../services/task.service";
import { AuthService } from "../services/auth.service";
import { EventEmiterService } from "../services/event.emmiter.service";

@Component({
  selector: "app-lists",
  templateUrl: "./lists.component.html",
  styleUrls: ["./lists.component.css"],
  providers: [OrderBy]
})
export class ListsComponent implements OnInit {

  tasks: Task[] = [];
  tasks_org: Task[] = [];
  tasks_completed: Task[] = [];
  taskForm: any;
  task_name: string;
  is_add_task: boolean;
  sortableOptions: any;
  category_id : string;

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    private _eventEmiter: EventEmiterService,
    private orderBy: OrderBy
  ) {
    this._eventEmiter.dataStr.subscribe(data => {
      this.getEventResponse(data);
    });
    this.sortableOptions = {
      sort: true,
      onUpdate: (event: any) => {
        //console.log("event ", event);
        //this.postChangesToServer();
      }
    };
  }
   ngOnInit() {
    this.createTaskForm();
    this.defaultUserLogin();
    this.getTasks();
    this.is_add_task = false;
  }
  createTaskForm() {
    this.taskForm = this.formBuilder.group({
      task_name: ["", Validators.required],
      category_id:["", Validators.required]
    });
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  addUnassignedTask(name: string, category_id:string): void {
    if (this.taskForm.valid) {
      this.is_add_task = true;
      if (this.authService.isAuthenticate()) {
        this.is_add_task = false;
        name = name.trim();
        if (!name) {
          return;
        }
       console.log("Category ",category_id);
       //var category_id = "2";
        this.taskService.addTask({name} as Task,{category_id} as any).subscribe(hero => {
          console.log("Add task sucessfulluy");
          this.resetForm();
          this.getTasks();
        });
      } else {
        this._eventEmiter.sendMessage({ signin: true });
      }
    } else {
      console.log("invlid form");
      this.validateAllFormFields(this.taskForm);
    }
  }
 defaultUserLogin(): void {}
  getTasks(): void {
    console.log("get tasks...");
    this.taskService.getTasks().subscribe(tasks => {
      console.log("view updatess ", tasks);
      this.filterTask(tasks);
    });
  }
  deleteTasks(task: Task): void {
    console.log(" delete task ",task);
    this.taskService.deleteTask(task).subscribe(task=>{
      this.getTasks();
    });
  }
  getEventResponse(data) {
    console.log(" data ", data);
    if (
      (data.user_signin != undefined && data.user_signin == true) ||
      (data.user_signout != undefined && data.user_signout == true)
    ) {
      this.getTasks();
    }

    if (
      this.is_add_task == true &&
      (data.user_signin != undefined && data.user_signin == true)
    ) {
      this.addUnassignedTask(this.task_name, "1");
    }
  }
  filterTask(tasks) {

    let tasks_anassgin = [];
    let tasks_completed = [];
    for (let index in tasks) {
      let task = tasks[index];
      if (task.status == 1) {
        tasks_completed.push(task);
      } else {
        tasks_anassgin.push(task);
      }
    }
    this.tasks = this.orderBy.transform(tasks_anassgin, ["+index"]);
    this.tasks_org = JSON.parse(JSON.stringify(this.tasks));
    this.tasks_completed = this.orderBy.transform(tasks_completed, ["+index"]);
  }
  resetForm() {
    this.task_name = "";
    this.taskForm.controls.task_name.markAsUntouched({ onlySelf: true });
    this.taskForm.controls.task_name.markAsPristine({ onlySelf: true });
    this.category_id = "";
    this.taskForm.controls.category_id.markAsUntouched({ onlySelf: true });
    this.taskForm.controls.category_id.markAsPristine({ onlySelf: true });
  }

}
