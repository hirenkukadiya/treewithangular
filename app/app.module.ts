import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule,HTTP_INTERCEPTORS  } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { SignupComponent } from "./signup/signup.component";
import { SigninComponent } from "./signin/signin.component";
import { EventEmiterService } from "./services/event.emmiter.service";
import { TokenInterceptor } from "./auth/token.interceptor";
import { SortablejsModule } from "angular-sortablejs";
import { OrderBy } from "./util/orderBy.pipe";
import { ListsComponent } from './lists/lists.component';
import { CategoryComponent } from './category/category.component';
import { GroupByPipe } from './util/group-by.pipe';
import { NgxTreeDndModule } from 'ngx-tree-dnd'; 

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SignupComponent,
    SigninComponent,
    OrderBy,
    ListsComponent,
    CategoryComponent,
    GroupByPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SortablejsModule,
    NgxTreeDndModule
  ],
  providers: [EventEmiterService,{
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule {}
