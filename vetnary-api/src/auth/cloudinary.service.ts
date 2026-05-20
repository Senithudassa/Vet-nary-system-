import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  /**
   * Uploads a file buffer to Cloudinary under the
   * "vetnary-doctor-certificates" folder.
   *
   * Cloudinary is auto-configured from the CLOUDINARY_URL environment variable
   * – no explicit config() call is required.
   */
  async uploadDoctorCertificate(
    buffer: Buffer,
    mimetype: string,
    originalName: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'vetnary-doctor-certificates',
          resource_type: 'image',
          // Use the original filename (without extension) as the public_id
          // so assets stay identifiable in the Cloudinary dashboard.
          public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, '')}`,
          overwrite: false,
        },
        (error, result: UploadApiResponse) => {
          if (error || !result) {
            return reject(
              new InternalServerErrorException(
                `Cloudinary upload failed: ${error?.message ?? 'unknown error'}`,
              ),
            );
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );

      uploadStream.end(buffer);
    });
  }
}
