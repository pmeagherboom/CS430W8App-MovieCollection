// Angular imports
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Routing
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

// Firebase
import {
  doc,
  getDoc
} from 'firebase/firestore';

import { db } from '../../main';

// Movie color service
import {
  MovieColorService
} from '../movie-color.service';

// Ionic components
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton
} from '@ionic/angular';

@Component({
  selector: 'app-media-details',
  templateUrl: './media-details.page.html',
  styleUrls: ['./media-details.page.scss'],

  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonBackButton,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})

export class MediaDetailsPage implements OnInit {

  // Movie ID from Firebase
  movieId: string = '';

  // Selected movie
  movie: any = null;

  // Color pulled from the movie cover
  movieColor: string = '#292726';

  constructor(
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private movieColorService: MovieColorService
  ) {}

  ngOnInit() {

    this.movieId =
      this.route.snapshot.paramMap.get('id') || '';

    this.loadMovie();
  }

  // Gets the selected movie from Firebase
  async loadMovie() {
    try {

      const movieRef =
        doc(
          db,
          'movies',
          this.movieId
        );

      const movieSnapshot =
        await getDoc(movieRef);

      if (movieSnapshot.exists()) {

        this.movie = {
          id: movieSnapshot.id,
          ...movieSnapshot.data()
        };

        // Gets the card color from the movie cover
        this.movieColor =
          await this.movieColorService.getMovieColor(
            this.movie.photo
          );

        this.changeDetector.detectChanges();

        console.log(
          'Movie details retrieved from Firebase:',
          this.movie
        );

      } else {

        console.log(
          'Movie not found'
        );
      }

    } catch (error) {

      console.log(
        'Error retrieving movie:',
        error
      );
    }
  }
}