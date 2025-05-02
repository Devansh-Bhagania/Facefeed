/**
 * Represents the bounding box of a detected face.
 */
export interface FaceBox {
  /**
   * The X coordinate of the top-left corner of the bounding box.
   */
  x: number;
  /**
   * The Y coordinate of the top-left corner of the bounding box.
   */
  y: number;
  /**
   * The width of the bounding box.
   */
  width: number;
  /**
   * The height of the bounding box.
   */
  height: number;
}

/**
 * Represents information about a detected face, including its location and attributes.
 */
export interface Face {
  /**
   * The bounding box of the detected face.
   */
  box: FaceBox;
  /**
   * The estimated age of the detected face.
   */
  age: number;
  /**
   * The estimated gender of the detected face (e.g., 'male' or 'female').
   */
  gender: string;
}

// NOTE: The actual face detection logic is now internal to the `estimateAgeGenderFlow`.
// This file now primarily serves to define the shared `Face` and `FaceBox` types.
// The `detectFaces` function is removed as it's not called directly by the frontend anymore.

