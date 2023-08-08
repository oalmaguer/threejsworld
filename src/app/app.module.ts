import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorldComponent } from './world/world.component';
import { ReplaceUnderscoresPipe } from './replace-underscores.directive';
import { CapitalizePipe } from './capitalize.directive';

@NgModule({
  declarations: [
    AppComponent,
    WorldComponent,
    ReplaceUnderscoresPipe,
    CapitalizePipe,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
