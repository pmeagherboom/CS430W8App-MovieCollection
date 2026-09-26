import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Firebase
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

import { db } from '../../main';

// Camera plugin
import {
  Camera,
  CameraOptions
} from '@awesome-cordova-plugins/camera/ngx';

// Routing
import { RouterLink } from '@angular/router';

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
  selector: 'app-add-media',
  templateUrl: './add-media.page.html',
  styleUrls: ['./add-media.page.scss'],

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
    RouterLink,
    CommonModule,
    FormsModule
  ],

  providers: [Camera]
})

export class AddMediaPage implements OnInit {

  title: string = '';
  year: number | null = null;
  format: string = '';
  genre: string = '';
  notes: string = '';
  photo: string = '';

  constructor(
    private camera: Camera,
    private alertController: AlertController
  ) { }

  ngOnInit() {}

  // Adds a movie to Firebase
  async addMovie() {
    try {

      await addDoc(collection(db, 'movies'), {

        title: this.title,
        year: this.year,
        format: this.format,
        genre: this.genre,
        notes: this.notes,
        photo: this.photo,

        // Saves when the movie was added for sorting
        dateAdded: serverTimestamp()
      });

      console.log('Movie added to Firebase');

      const alert = await this.alertController.create({
        header: 'Movie Added!',
        message: `${this.title} was added to your collection.`,
        buttons: ['OK']
      });

      await alert.present();
      await alert.onDidDismiss();

      // Clears the form
      this.title = '';
      this.year = null;
      this.format = '';
      this.genre = '';
      this.notes = '';
      this.photo = '';

    } catch (error) {

      console.log('Error adding movie:', error);

    }
  }

  // Opens the camera
  takePhoto() {

    const options: CameraOptions = {

      quality: 50,

      destinationType:
        this.camera.DestinationType.DATA_URL,

      encodingType:
        this.camera.EncodingType.JPEG,

      mediaType:
        this.camera.MediaType.PICTURE,

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
      this.photo =
        'data:image/jpeg;base64,' + base64Data;

      console.log('Photo captured');

    }).catch((error) => {

      console.log('Camera error:', error);

    });
  }
}