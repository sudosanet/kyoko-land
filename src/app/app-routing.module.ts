import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { AboutComponent } from './about/about.component';
import { OtherComponent } from './other/other.component';
import { CreditComponent } from './credit/credit.component';
import { NotfoundComponent } from './notfound/notfound.component'

const routes: Routes = [
  { path: '', component: MainpageComponent },
  { path: 'starlight', component: TestComponent },
  { path: 'introduction', component: IntroductionComponent },
  { path: 'about', component: AboutComponent },
  { path: 'other', component: OtherComponent },
  { path: 'credit', component: CreditComponent },
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
