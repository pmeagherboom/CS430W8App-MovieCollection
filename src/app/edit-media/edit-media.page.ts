// Angular imports
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Routing
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Firebase
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../main';

// Camera plugin
import {
  Camera,
  CameraOptions
} from '@awesome-cordova-plugins/camera/ngx';

// Ionic components
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonBackButton,
  AlertController
} from '@ionic/angular';

@Component({
  selector: 'app-edit-media',
  templateUrl: './edit-media.page.html',
  styleUrls: ['./edit-media.page.scss'],

  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    IonBackButton,
    CommonModule,
    FormsModule,
    RouterLink
  ],

  providers: [Camera]
})

export class EditMediaPage implements OnInit {

  // Movie ID from Firebase
  movieId: string = '';

  // Movie info for the edit form
  title: string = '';
  year: number | null = null;
  format: string = '';
  genre: string = '';
  notes: string = '';

  // Current movie photo
  photo: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private changeDetector: ChangeDetectorRef,
    private camera: Camera
  ) {}

  ngOnInit() {

    // Gets the movie ID from the URL
    this.movieId = this.route.snapshot.paramMap.get('id') || '';

    this.loadMovie();
  }

  // Gets the movie from Firebase
  async loadMovie() {
    try {

      const movieRef = doc(db, 'movies', this.movieId);
      const movieSnapshot = await getDoc(movieRef);

      if (movieSnapshot.exists()) {

        const movie: any = movieSnapshot.data();

        // Fills in the edit form
        this.title = movie.title;
        this.year = movie.year;
        this.format = movie.format;
        this.genre = movie.genre;
        this.notes = movie.notes;

        // Loads the current photo
        this.photo = movie.photo || '';

        this.changeDetector.detectChanges();

        console.log('Movie loaded for editing:', movie);

      } else {

        console.log('Movie not found');

      }

    } catch (error) {

      console.log('Error retrieving movie:', error);

    }
  }

  // Opens the camera to change the photo
  changePhoto() {

    const options: CameraOptions = {

      // Keeps the image smaller for Firebase
      quality: 50,

      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,

      targetWidth: 500,
      targetHeight: 500,

      correctOrientation: true
    };

    this.camera.getPicture(options).then((imageData) => {

      // Removes an existing image prefix if there is one
      const base64Data = imageData.replace(
        /^(data:image\/[a-zA-Z]+;base64,)+/,
        ''
      );

      // Adds the correct image prefix
      this.photo = 'data:image/jpeg;base64,' + base64Data;

      this.changeDetector.detectChanges();

      console.log('Movie photo changed');

    }).catch((error) => {

      console.log('Camera error:', error);

    });
  }

  // Saves the changes to Firebase
  async updateMovie() {
    try {

      const movieRef = doc(db, 'movies', this.movieId);

      await updateDoc(movieRef, {
        title: this.title,
        year: this.year,
        format: this.format,
        genre: this.genre,
        notes: this.notes,
        photo: this.photo
      });

      console.log('Movie updated in Firebase');

      const alert = await this.alertController.create({
        header: 'Movie Updated!',
        message: `${this.title} was updated successfully.`,
        buttons: ['OK']
      });

      await alert.present();
      await alert.onDidDismiss();

      // Goes back to the movie details
      this.router.navigate(['/media-details', this.movieId]);

    } catch (error) {

      console.log('Error updating movie:', error);

    }
  }

  // Confirms before deleting
  async confirmDelete() {

    const alert = await this.alertController.create({
      header: 'Delete Movie?',
      message: `Are you sure you want to delete ${this.title} from your collection?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteMovie();
          }
        }
      ]
    });

    await alert.present();
  }

  // Deletes the movie from Firebase
  async deleteMovie() {
    try {

      const movieRef = doc(db, 'movies', this.movieId);

      await deleteDoc(movieRef);

      console.log('Movie deleted from Firebase');

      // Goes back to the collection
      this.router.navigate(['/home']);

    } catch (error) {

      console.log('Error deleting movie:', error);

    }
  }
}