import { Routes } from '@angular/router';

export const routes: Routes = [

  // Home page
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
  },

  // Opens Home when the app starts
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  // Add Media page
  {
    path: 'add-media',
    loadComponent: () =>
      import('./add-media/add-media.page').then((m) => m.AddMediaPage)
  },

  // Movie details page
  {
    path: 'media-details/:id',
    loadComponent: () =>
      import('./media-details/media-details.page').then((m) => m.MediaDetailsPage)
  },

  // Edit Media page
  {
    path: 'edit-media/:id',
    loadComponent: () =>
      import('./edit-media/edit-media.page').then((m) => m.EditMediaPage)
  }

];