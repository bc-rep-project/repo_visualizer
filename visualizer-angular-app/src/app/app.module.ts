// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { HttpClientModule } from '@angular/common/http';

// import { AppComponent } from './app.component';

// @NgModule({
//   declarations: [AppComponent],
//   imports: [BrowserModule, HttpClientModule],
//   providers: [],
//   bootstrap: [AppComponent]
// })
// export class AppModule { }


// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { AppComponent } from './app.component';

// @NgModule({
//   declarations: [AppComponent],
//   imports: [BrowserModule],
//   providers: [
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: HttpClientModule,
//       multi: true
//     }
//   ],
//   bootstrap: [AppComponent]
// })
// export class AppModule { }


import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, CodeVisualizerComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule],
  providers: [ GithubApiService ],
  bootstrap: [AppComponent]
})
export class AppModule { }