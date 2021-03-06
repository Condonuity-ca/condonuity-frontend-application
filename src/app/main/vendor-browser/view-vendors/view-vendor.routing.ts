
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { ViewVendorsComponent } from './view-vendors.component';


const routes: Routes = [
  { path: '', component: ViewVendorsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ViewVendorRouting {
}