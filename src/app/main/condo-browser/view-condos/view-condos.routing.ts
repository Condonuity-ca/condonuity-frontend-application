
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { ViewCondosComponent } from './view-condos.component';


const routes: Routes = [
  { path: '', component: ViewCondosComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ViewCondosRouting {
}