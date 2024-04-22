
  import { Routes } from '@angular/router';
  import {Home} from './pages/Home.component';
import {about} from './pages/about.component';

  export const appRoutes: Routes = [
    { path: '/', component: Home },
{ path: 'about', component: about },

  ];
  