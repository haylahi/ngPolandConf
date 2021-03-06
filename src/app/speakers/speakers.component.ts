import { Component, OnInit } from "@angular/core";
import * as app from "application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";

@Component({
  selector: "Speakers",
  moduleId: module.id,
  templateUrl: "./speakers.component.html"
})
export class SpeakersComponent implements OnInit {
  constructor() {
    // Use the component constructor to inject providers.
  }

  ngOnInit(): void {}

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
  }
}
