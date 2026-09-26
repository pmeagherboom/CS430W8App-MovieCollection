import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class MovieColorService {

  // Gets a color from the movie cover
  getMovieColor(photo: string): Promise<string> {

    return new Promise((resolve) => {

      // Uses the default color if there is no photo
      if (!photo) {
        resolve('#292726');
        return;
      }

      const image = new Image();

      image.onload = () => {

        const canvas =
          document.createElement('canvas');

        const context =
          canvas.getContext('2d');

        if (!context) {
          resolve('#292726');
          return;
        }

        // Focuses on the middle of the cover to avoid the edges and Blu-ray headers
        const sourceX =
          image.width * 0.12;

        const sourceY =
          image.height * 0.15;

        const sourceWidth =
          image.width * 0.76;

        const sourceHeight =
          image.height * 0.75;

        canvas.width = 40;
        canvas.height = 40;

        context.drawImage(
          image,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          40,
          40
        );

        const imageData =
          context.getImageData(
            0,
            0,
            40,
            40
          ).data;

        // Groups similar colors
        const colorGroups = new Map<
          string,
          {
            red: number,
            green: number,
            blue: number,
            count: number,
            saturation: number
          }
        >();

        let usablePixels = 0;

        for (
          let i = 0;
          i < imageData.length;
          i += 4
        ) {

          const pixelRed =
            imageData[i];

          const pixelGreen =
            imageData[i + 1];

          const pixelBlue =
            imageData[i + 2];

          const maximum = Math.max(
            pixelRed,
            pixelGreen,
            pixelBlue
          );

          const minimum = Math.min(
            pixelRed,
            pixelGreen,
            pixelBlue
          );

          const saturation =
            maximum - minimum;

          const brightness =
            (
              pixelRed +
              pixelGreen +
              pixelBlue
            ) / 3;

          // Skips colors that are too dark, bright, or gray
          if (
            brightness < 35 ||
            brightness > 225 ||
            saturation < 25
          ) {
            continue;
          }

          usablePixels++;

          // Groups similar colors together
          const bucketSize = 40;

          const groupedRed =
            Math.round(
              pixelRed / bucketSize
            ) * bucketSize;

          const groupedGreen =
            Math.round(
              pixelGreen / bucketSize
            ) * bucketSize;

          const groupedBlue =
            Math.round(
              pixelBlue / bucketSize
            ) * bucketSize;

          const key =
            `${groupedRed}-${groupedGreen}-${groupedBlue}`;

          const existingGroup =
            colorGroups.get(key);

          if (existingGroup) {

            existingGroup.red +=
              pixelRed;

            existingGroup.green +=
              pixelGreen;

            existingGroup.blue +=
              pixelBlue;

            existingGroup.saturation +=
              saturation;

            existingGroup.count++;

          } else {

            colorGroups.set(key, {
              red: pixelRed,
              green: pixelGreen,
              blue: pixelBlue,
              count: 1,
              saturation: saturation
            });
          }
        }

        // Uses the default if no usable colors were found
        if (
          usablePixels === 0 ||
          colorGroups.size === 0
        ) {

          resolve('#292726');
          return;
        }

        let selectedColor: any = null;
        let bestScore = 0;

        // Finds the best color group
        colorGroups.forEach((group) => {

          const percentage =
            group.count / usablePixels;

          // Skips tiny color groups
          if (percentage < 0.025) {
            return;
          }

          const averageSaturation =
            group.saturation /
            group.count;

          const score =
            group.count *
            Math.pow(
              averageSaturation,
              1.35
            );

          if (score > bestScore) {

            bestScore = score;
            selectedColor = group;
          }
        });

        if (!selectedColor) {

          resolve('#292726');
          return;
        }

        // Gets the average color from the selected group
        let red = Math.round(
          selectedColor.red /
          selectedColor.count
        );

        let green = Math.round(
          selectedColor.green /
          selectedColor.count
        );

        let blue = Math.round(
          selectedColor.blue /
          selectedColor.count
        );

        // Darkens the color so it works better behind the movie info
        red = Math.round(
          (red * 0.55) +
          (25 * 0.45)
        );

        green = Math.round(
          (green * 0.55) +
          (25 * 0.45)
        );

        blue = Math.round(
          (blue * 0.55) +
          (25 * 0.45)
        );

        resolve(
          `rgb(${red}, ${green}, ${blue})`
        );
      };

      // Uses the default if the image does not load
      image.onerror = () => {
        resolve('#292726');
      };

      image.src = photo;
    });
  }
}