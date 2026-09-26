// Angular imports
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { RouterLink } from '@angular/router';

// Firebase
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../main';

// Movie color service
import { MovieColorService } from '../movie-color.service';

// Ionic components
import {
  IonContent,
  IonSearchbar,
  IonButton,
  IonFooter,
  IonToolbar,
  IonSelect,
  IonSelectOption
} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],

  imports: [
    IonContent,
    IonSearchbar,
    IonButton,
    IonFooter,
    IonToolbar,
    IonSelect,
    IonSelectOption,
    RouterLink,
    CommonModule
  ]
})

export class HomePage implements OnInit {

  // All movies from Firebase
  movies: any[] = [];

  // Movies currently shown on the page
  filteredMovies: any[] = [];

  // Current sort option
  sortOption: string = 'dateAdded';

  // Current search
  searchTerm: string = '';

  constructor(
    private changeDetector: ChangeDetectorRef,
    private movieColorService: MovieColorService
  ) {}

  ngOnInit() {
    this.loadMovies();
  }

  ionViewWillEnter() {
    this.loadMovies();
  }

  // Gets the movies from Firebase
  async loadMovies() {
    try {

      const querySnapshot = await getDocs(
        collection(db, 'movies')
      );

      this.movies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Gets a card color from each movie cover
      for (const movie of this.movies) {

        movie.cardColor =
          await this.movieColorService.getMovieColor(
            movie.photo
          );
      }

      // Applies search and sorting
      this.updateDisplayedMovies();

      this.changeDetector.detectChanges();

      console.log(
        'Movies retrieved from Firebase:',
        this.movies
      );

    } catch (error) {

      console.log(
        'Error retrieving movies:',
        error
      );
    }
  }

  // Searches by movie title
  searchMovies(event: any) {

    this.searchTerm =
      event.target.value?.toLowerCase() || '';

    this.updateDisplayedMovies();
  }

  // Changes the sort option
  sortMovies(event: any) {

    this.sortOption =
      event.detail.value;

    this.updateDisplayedMovies();
  }

  // Updates the movies shown on the page
  updateDisplayedMovies() {

    let displayedMovies =
      [...this.movies];

    // Filters by the search term
    if (this.searchTerm) {

      displayedMovies =
        displayedMovies.filter((movie) =>
          movie.title
            .toLowerCase()
            .includes(this.searchTerm)
        );
    }

    // Sorts the movie list
    switch (this.sortOption) {

      // Newest additions first
      case 'dateAdded':

        displayedMovies.sort((a, b) => {

          const dateA =
            a.dateAdded?.toMillis?.() || 0;

          const dateB =
            b.dateAdded?.toMillis?.() || 0;

          return dateB - dateA;
        });

        break;

      // Alphabetical without counting "The"
      case 'title':

        displayedMovies.sort((a, b) => {

          const titleA =
            a.title.replace(
              /^The\s+/i,
              ''
            );

          const titleB =
            b.title.replace(
              /^The\s+/i,
              ''
            );

          return titleA.localeCompare(
            titleB
          );
        });

        break;

      // Newest release year first
      case 'year':

        displayedMovies.sort((a, b) =>
          Number(b.year) -
          Number(a.year)
        );

        break;

      // Groups by format
      case 'format':

        displayedMovies.sort((a, b) =>
          a.format.localeCompare(
            b.format
          )
        );

        break;
    }

    this.filteredMovies =
      displayedMovies;

    this.changeDetector.detectChanges();
  }
}