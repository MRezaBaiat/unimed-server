import { Injectable } from '@nestjs/common';
import fs, { ReadStream } from 'fs';
import { URL } from 'url';
import NotFoundError from '../../errors/not-found-error';
import util from 'util';
import { Chat, FileInfo, FileMetaData, Helper } from 'api';
import { Connection } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import FilesRepo from '../../databases/files.repo';
import { Request, Response } from '../index';
import { MultipartFile } from 'fastify-multipart';
import { ObjectId } from '../../databases/utils';
import BadRequestError from '../../errors/badrequest-error';
import { ServiceUnavailableError } from '../../errors/service.unavailable.error';
import { InjectConnection } from '@nestjs/mongoose/';

const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

@Injectable()
export class FilesService {
  private bucket: GridFSBucket

  constructor (private filesRepo: FilesRepo, @InjectConnection() private connection: Connection) {
    this.bucket = new GridFSBucket(connection.db);
  }

  public async pipeToFile (file: MultipartFile, destinationPath: string) {
    return pump(file.file, fs.createWriteStream(destinationPath));
  }

  private createUrl (id: string) {
    return `${process.env.PUBLIC_URL}/api/files?id=${id}`;
  }

  private createChatMediaUrl (id: string) {
    return `${process.env.PUBLIC_URL}/api/files/chat?id=${id}`;
  }

  public async copyFromStream (stream: ReadStream, filename: string, mimetype: string, metadata: FileMetaData, oldUrl?: string): Promise<FileInfo> {
    return new Promise((resolve, reject) => {
      try {
        const id = new ObjectId();
        const uploadStream = this.bucket.openUploadStreamWithId(
          id,
          filename,
          {
            contentType: mimetype,
            metadata: {
              ...metadata
            }
          }
        );

        stream.on('end', async () => {
          console.log('end on stream');
        });

        uploadStream.on('finish', async () => {
          console.log('finish on upload stream');
          await this.filesRepo.crud().withId(id).set({ url: metadata.roomId ? this.createChatMediaUrl(String(id)) : this.createUrl(String(id)), oldUrl }).updateOne();
          const file = await this.filesRepo.crud().withId(id).findOne();
          resolve(file);
        });

        uploadStream.on('error', reject);
        stream.on('error', reject);

        stream.pipe(uploadStream);
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }

  public async upload (request: Request, metadata: FileMetaData): Promise<FileInfo> {
    return new Promise((resolve, reject) => {
      try {
        request.multipart((field, file, filename, encoding, mimetype) => {
          this.copyFromStream(file, filename, mimetype, metadata).then(resolve).catch(reject);
        },
        (err) => {
          if (err) {
            console.error(err);
            reject(new ServiceUnavailableError());
          }
        }
        );
      } catch (e) {
        console.error(e);
        reject(new ServiceUnavailableError());
      }
    });
  }

  public async download (id: string, request: Request, response: Response) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestError('invalid file id');
      }

      const oId = new ObjectId(id);
      const fileInfo = await this.filesRepo.crud().withId(id).findOne();

      if (!fileInfo) {
        throw new NotFoundError('file not found');
      }

      if (request.headers.range) {
        const range = request.headers.range.substr(6).split('-');
        const start = parseInt(range[0], 10);
        const end = parseInt(range[1], 10) || null;
        const readStream = this.bucket.openDownloadStream(oId, {
          start,
          end
        });

        response.status(206);
        response.headers({
          'Accept-Ranges': 'bytes',
          'Content-Type': fileInfo.contentType,
          'Content-Range': `bytes ${start}-${end || fileInfo.length - 1}/${
              fileInfo.length
          }`,
          'Content-Length': (end || fileInfo.length) - start,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`
        });

        response.raw.on('close', () => {
          readStream.destroy();
        });

        response.send(readStream);
      } else {
        const readStream = this.bucket.openDownloadStream(oId);

        response.raw.on('close', () => {
          readStream.destroy();
        });

        response.status(200);
        response.headers({
          'Accept-Range': 'bytes',
          'Content-Type': fileInfo.contentType,
          'Content-Length': fileInfo.length,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`
        });

        response.send(readStream);
      }
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableError();
    }
  }

  public async delete (fileUrl: string) {
    const fileId = new URL(fileUrl).searchParams.get('q');
    return this.filesRepo.crud().withId(fileId).deleteOne();
  }
}
