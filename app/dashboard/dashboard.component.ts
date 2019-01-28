import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";

import { OrderBy } from "../util/orderBy.pipe";
import { GroupByPipe } from "../util/group-by.pipe";
import { Task } from "../task";
import { Category } from "../category";
import { TaskService } from "../services/task.service";
import { AuthService } from "../services/auth.service";
import { EventEmiterService } from "../services/event.emmiter.service";
//import {NodeEvent, TreeModel, RenamableNode } from 'ng2-tree';
import { Observable, of } from "rxjs";
import { map, filter, scan } from "rxjs/operators";
import { webSocket } from "rxjs/webSocket";
import { ajax } from "rxjs/ajax";
import { TestScheduler } from "rxjs/testing";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  providers: [OrderBy, GroupByPipe]
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  tasks_org: Task[] = [];
  tasks_completed: Task[] = [];
  taskForm: any;
  task_name: string;
  is_add_task: boolean;
  sortableOptions: any;
  category_id: string;
  category: any;
  cat_name: any;
  cat_ids: Task[] = [];
  myTree: any;
  category_lists: Task[] = [];
  unassinged_tasks: Task[] = [];
  public show_dialog : boolean = false;

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
        this.postChangesToServer();
      }
    };
  }

  ngOnInit() {
    this.defaultUserLogin();
    this.getTasks();
    this.getCategory();
    this.createTaskForm();
    this.is_add_task = false;
  }
  config = {
    showActionButtons: true,
    showAddButtons: true,
    /*hidden: true,*/
    showRenameButtons: true,
    showRootActionButtons: false,
    enableExpandButtons: true,
    enableDragging: true,
    rootTitle: "Task",
    validationText: "Enter valid Task",
    minCharacterLength: 4,
    setItemsAsLinks: false,
    setFontSize: 14,
    setIconSize: 14
  };
  createTaskForm() {
    this.taskForm = this.formBuilder.group({
      task_name: ["", Validators.required],
      category_id: ["", ""]
    });
  }
  deleteTasks(task: Task): void {
    console.log(" delete task ", task);
    this.taskService.deleteTask(task).subscribe(task => {
      this.getTasks();
    });
  }
  getTasks(): void {
    //console.log("get tasks...");
    this.taskService.getTasks().subscribe(tasks => {
      //console.log("view not update ", tasks);
      this.filterTask(tasks);
    });
  }
  getCategory(): void {
    this.taskService.getCategory().subscribe(category => {
      this.filterCategroy(category);
    });
  }
  filterTask(tasks) {
    let tasks_anassgin = [];
    let tasks_unassinged = [];
    let tasks_completed = [];
    for (let index in tasks) {
      let task = tasks[index];

      if (task.status == 1) {
        tasks_completed.push(task);
      } /*else if(task.category_name === 'unassinged' || task.category_name === ''){
        tasks_unassinged.push(task);
      } */ else {
        tasks_anassgin.push(task);
      }
    }

    //this.tasks = this.orderBy.transform(tasks_anassgin, ["+index"]);
    this.tasks = tasks_anassgin;
    //this.unassinged_tasks = this.orderBy.transform(tasks_unassinged, ["+index"]);
    this.unassinged_tasks = tasks_unassinged;
    this.cat_name = Array.from(
      new Set(tasks_anassgin.map(({ category_name }) => category_name))
    );
    this.cat_ids = Array.from(
      new Set(tasks_anassgin.map(({ category_id }) => category_id))
    );
    this.tasks_org = JSON.parse(JSON.stringify(this.tasks));
    //this.tasks_completed = this.orderBy.transform(tasks_completed, ["+index"]);
    this.tasks_completed = tasks_completed;
    var intervalId = setInterval(function() {}, 500);
    this.myTree = [];
    var catData = this.getParentCategory(this.cat_ids);
    //console.log('category data', catData[0]);
    if (catData.length > 0) {
      for (var index in catData) {
        this.myTree.push(catData[index]);
      }
    }
    console.log("this.myTree ", this.myTree);
  }

  filterCategroy(category) {
    let category_list = [];
    let tasks_completed = [];
    for (let index in category) {
      let task = category[index];

      if (task.name == "unassinged") {
        //tasks_completed.push(task);
      } else {
        category_list.push({
          value: task.categoryID,
          label: task.name,
          index: task.index
        });
      }
    }
    category_list.sort(function(a, b) {
      return a.index - b.index;
    });
    this.category_lists = category_list;
    //console.log('Category List', category_list);
    this.category = category_list;
    this.category_id = "";
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
    //console.log("input ", input);
    this.taskService.updateTask(task).subscribe(task => {
      this.getTasks();
    });
  }
  addUnassignedTask(name: string, category_id: string): void {
    if (this.taskForm.valid) {
      this.is_add_task = true;
      if (this.authService.isAuthenticate()) {
        this.is_add_task = false;
        name = name.trim();
        if (!name) {
          return;
        }
        //console.log("Category ",category_id);
        this.taskService
          .addTask({ name } as Task, { category_id } as any)
          .subscribe(hero => {
            //console.log("Add task sucessfulluy");
            this.resetForm();
            this.getTasks();
          });
      } else {
        this._eventEmiter.sendMessage({ signin: true });
      }
    } else {
      //console.log("invlid form");
      this.validateAllFormFields(this.taskForm);
    }
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

  defaultUserLogin(): void {}

  getEventResponse(data) {
    //console.log(" data ", data);
    if (
      (data.user_signin != undefined && data.user_signin == true) ||
      (data.user_signout != undefined && data.user_signout == true)
    ) {
      this.getTasks();
      this.getCategory();
    }

    if (
      this.is_add_task == true &&
      (data.user_signin != undefined && data.user_signin == true)
    ) {
      this.addUnassignedTask(this.task_name, "1");
    }
  }
  postChangesToServer() {
    var logEntry = this.tasks
      .map(function(i) {
        return i.index;
      })
      .join(", ");
    var logEntry1 = this.tasks_org
      .map(function(i) {
        return i.index;
      })
      .join(", ");
    for (let index in this.tasks_org) {
      let o_task = this.tasks_org[index];
      if (this.tasks[index] != undefined) {
        this.tasks[index].index = o_task.index;
      }
    }
    for (var index in this.tasks) {
      let task = this.tasks[index];
      let input = {};
      input["task"] = task;
      this.taskService.updateTask(task).subscribe();
    }
  }
  resetForm() {
    this.task_name = "";
    this.taskForm.controls.task_name.markAsUntouched({ onlySelf: true });
    this.taskForm.controls.task_name.markAsPristine({ onlySelf: true });
    // this.category_id = "";
    // this.taskForm.controls.category_id.markAsUntouched({ onlySelf: true });
    // this.taskForm.controls.category_id.markAsPristine({ onlySelf: true });
  }

  /*Tree View */
  getParentCategory(datas) {
    let parents = [];
    let category = datas;

    for (let i = 0; i < category.length; i++) {
      let childs = {};
      if (category[i] != "") {
        if (this.cat_name[i] == undefined) {
          this.cat_name[i] = "unassinged";
        }
        childs["name"] = this.cat_name[i];
        childs["id"] = this.cat_ids[i];
        childs["childrens"] = this.getChilTask(this.cat_ids[i]);
        parents.push(childs);
      }
    }
    return parents;
  }
  getChilTask(cate) {
    let childrens = [];
    let childrens_ids = {};
    let childrens_next_ids = {};
    let datas = this.tasks;
    var data_abd = [];

    for (let i = 0; i < datas.length; i++) {
      if (
        datas[i].hasOwnProperty("name") &&
        datas[i].hasOwnProperty("category_id") &&
        datas[i]["category_id"] === cate
      ) {
        var child = {};
        child["name"] = datas[i].name;
        child["id"] = datas[i].taskID;
        child["prev"] = datas[i].previous;
        child["next"] = datas[i].next;
        child["priority"] = datas[i].priority;
        child["childrens"] = [];
        childrens.push(child);
        childrens_ids[datas[i].taskID] = child;
        childrens_next_ids[datas[i].taskID] = datas[i].next;  
      }
    }
    //console.log("data_abd ", data_abd);
    return childrens;
  }
  onDragStart(event) {
    console.log("On drag star", event);
  }
  onCompleteTask(event) {
    //console.log('Complete Task',event);
    let task = new Task();
    var taskID = event.element.id;
    console.log("task_id", event.element.id);
    if (task.status == undefined) {
      task.status = 1;
    } else {
      if (task.status == 0) {
        task.status = 1;
      } else {
        task.status = 0;
      }
    }
    task.taskID = event.element.id;
    var input = {};
    input["task"] = task;
    this.taskService.updateTask(task).subscribe(task => {
      this.getTasks();
    });
  }
  onSetPriority(event) {
    let task = new Task();
    var taskID = event.element.id;
    if (event.element.priority == undefined) {
      task.priority = 1;
    } else {
      task.priority = event.element.priority;
    }
    task.taskID = event.element.id;
    var input = {};
    input["task"] = task;
    this.taskService.updateTask(task).subscribe(task => {
      this.getTasks();
    });
  }
  onDrop(event) {
    console.log("events", event);
    //console.log('On Drop Events', this.myTree);
    /* setTimeout(() => {
      let treedata = this.myTree;
      let treeRecords = [];
      for (let i = 0; i < treedata.length; i++) {
        let childrens: any;
        childrens = treedata[i].childrens;
        console.log("Childrens", childrens);
        for (let j = 0; j < childrens.length; j++) {
          console.log("Childrens name => ", childrens[j].name);
          let treeDatas = [];
          treeDatas["categoryID"] = treedata[i].id;
          treeDatas["taskID"] = childrens[j].id;
          treeDatas["name"] = childrens[j].name;
          treeDatas["index"] = j;
          treeRecords.push(treeDatas);
        }
      }
    }, 1000); */
    //console.log(treeRecords);
  }
  onAllowDrop(event) {
    //console.log('On Allow Drag', event);
  }
  onDragEnter(event) {
    //console.log('On DragEnter', event);
  }
  onDragLeave(event) {
    //console.log('On Drag Leave', event);
  }
  onAddItem(event) {
    console.log("Add Items", event);
  }
  onStartRenameItem(event) {
    console.log("Start Rename", event);
  }
  onFinishRenameItem(event) {
    console.log("Rename End", event);
  }
  onFinishDelete(event) {
    console.log("On Delete", event.element.id);
    let task = new Task();
    task["taskID"] = event.element.id;
    this.deleteTasks(task);
  }
  display_filter(){
    this.show_dialog = !this.show_dialog;
  }
  filter(filter){
    //alert(filter);
  }
}
