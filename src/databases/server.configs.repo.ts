import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose';
import { ServerConfig } from 'api';
import { Document, Model } from 'mongoose';
import QueryBuilder from './utils/query.builder';

export type ServerConfigsDocument = ServerConfig & Document;
export const ServerConfigsSchema = SchemaFactory.createForClass(ServerConfig).pre(
  ['find', 'findOne', 'findOneAndUpdate'],
  function () {
    // should not be arrow function
    this.lean();
  }
);

@Injectable()
export default class ServerConfigsRepo {
  constructor (@InjectModel('server_config') private configsDB: Model<ServerConfigsDocument>) {
    // this.configsDB.deleteMany({}).exec();
    this.configsDB.findOne({}).then((configs) => {
      if (configs) {
        return;
      }
      console.log('CREATING');
      this.crud().create({
        android: {
          versionCode: '1.0',
          changeLog: 'no change',
          downloadLink: 'www.matap.com',
          forceUpdate: false
        },
        ios: {
          versionCode: '1.0',
          changeLog: 'no change',
          downloadLink: 'www.matap.com',
          forceUpdate: false
        },
        retryThreshold: 2000,
        trickleIce: true,
        iceTransportPolicy: 'relay',
        iceServers: [
          {
            username: 'webrtc_user1',
            credential: 'fsfji54235fslnvlk987cvzq',
            urls: [
              'turn:185.112.33.110:3478?transport=tcp'
            ]
          },
          {
            username: 'matap',
            credential: 'M@t@p12',
            urls: [
              'turn:turn.hamavahost.ir:5349'
            ]
          },
          {
            username: '30HYY6cRDxxU8nr44gmwl_WNqdA4wWaholAuicL2HT-mxIK5mYFoXApGvvGbte0WAAAAAF6cE0NtYXRhcA==',
            credential: '44d2d42a-821c-11ea-8c40-02ca4b67e38f',
            urls: [
              'turn:eu-turn6-back.xirsys.com:80?transport=udp'
            ]
          }
        ],
        mediaConstraints: {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            // autoGainControl: true,
            channelCount: 2
            /* autoGainControl: true,
                                            googEchoCancellation: true,
                                            googAutoGainControl: true,
                                            googNoiseSuppression: true,
                                            googHighpassFilter: true,
                                            googTypingNoiseDetection: true,
                                            googNoiseReduction: true,
                                            googEchoCancellation2: true,
                                            googDAEchoCancellation: true */
          },
          video: {
            mandatory: {
              minWidth: 640,
              minHeight: 360,
              minFrameRate: 30
            }
          }
        },
        forceSpeaker: false,
        termsandconditions: ''
      });
    });
  }

  public crud () {
    return new QueryBuilder<ServerConfig>(this.configsDB, ServerConfig);
  }

  public getConfigs () {
    return this.configsDB.findOne({});
  }
}
