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
import { Category } from "../category";
import { CategoryService } from "../services/category.service";
import { AuthService } from "../services/auth.service";
import { EventEmiterService } from "../services/event.emmiter.service";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  providers: [OrderBy]
})
export class CategoryComponent implements OnInit {

  tasks: Category[] = [];
  tasks_org: Category[] = [];
  tasks_completed: Category[] = [];
  CategoryForm: any;
  name: string;
  is_add_task: boolean;
  sortableOptions: any;
  categoryID : string;

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private categoryservice: CategoryService,
    private authService: AuthService,
    private _eventEmiter: EventEmiterService,
    private orderBy: OrderBy
  ) {
  }
   ngOnInit() {
    this.createCatForm();
    this.defaultUserLogin();
    this.getCategory();
    //this.is_add_task = false;
  }
  createCatForm() {
    this.CategoryForm = this.formBuilder.group({
      name: ["", Validators.required]
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
  toggleCheckBox(task: Task): void {
    if (task.status == undefined) {
      task.status = 1;
    } else {
      if (task.status == 0) {
        task.status = 1;
      } else {
        task.status = 0;
      }
    }
    var input = {};
    input["task"] = task;
    console.log("input ", input);
    this.categoryservice.updateTask(task).subscribe(task=>{
      this.getCategory();
    });
  }
  addCategory(name: string, category_id:string): void {
    if (this.CategoryForm.valid) {
      this.is_add_task = true;
      if (this.authService.isAuthenticate()) {
        this.is_add_task = false;
        name = name.trim();
        if (!name) {
          return;
        }
       console.log("Category ",name);
       //return;
       //var category_id = "2";
        this.categoryservice.addTask({name} as Task).subscribe(hero => {
          console.log("Add task sucessfulluy");
          this.resetForm();
          this.getCategory();
        });
      } else {
        this._eventEmiter.sendMessage({ signin: true });
      }
    } else {
      console.log("invlid form");
      this.validateAllFormFields(this.CategoryForm);
    }
  }
 defaultUserLogin(): void {}
 getCategory(): void {
    console.log("get category...");
    this.categoryservice.getCategory().subscribe(Category => {
      //console.log("view updatess ", tasks);
      this.ViewCate(Category);
    });
  }
 ViewCate(Category) {
    let tasks_anassgin = [];
    let tasks_completed = [];
    for (let index in Category) {
      let task = Category[index];
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
    this.name = "";
    this.CategoryForm.controls.name.markAsUntouched({ onlySelf: true });
    this.CategoryForm.controls.name.markAsPristine({ onlySelf: true });
  }
  deleteCate(task: Category): void {
    console.log(" delete cate ",task);
    this.categoryservice.deletecate(task).subscribe(task=>{
      this.getCategory();
    });
  }
}
