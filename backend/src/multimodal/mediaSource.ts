import type { MediaSourceType, VideoFormat } from '../models/multimodal';

export interface IMediaSource {
  readonly id: string;
  readonly type: MediaSourceType;
  readonly reference: string;
  readonly format: VideoFormat;
  readonly isLive: boolean;
  getStreamInfo(): { durationSeconds: number; fps: number; resolution: string; isRealtime: boolean };
}

export class UploadedVideoSource implements IMediaSource {
  readonly type: MediaSourceType = 'UPLOADED_VIDEO';
  readonly isLive = false;

  constructor(
    public readonly id: string,
    public readonly reference: string,
    public readonly format: VideoFormat = 'MP4',
    private readonly estimatedDuration = 600,
    private readonly resolution = '1920x1080',
    private readonly fps = 30
  ) {}

  getStreamInfo() {
    return {
      durationSeconds: this.estimatedDuration,
      fps: this.fps,
      resolution: this.resolution,
      isRealtime: false,
    };
  }
}

export class LiveCameraSource implements IMediaSource {
  readonly type: MediaSourceType = 'LIVE_CAMERA';
  readonly isLive = true;
  readonly format: VideoFormat = 'LIVE_STREAM';

  constructor(
    public readonly id: string,
    public readonly reference: string, // e.g. "rtsp://...", "webrtc://...", "camera://0"
    private readonly resolution = '1920x1080',
    private readonly fps = 30
  ) {}

  getStreamInfo() {
    return {
      durationSeconds: 0, // dynamic / streaming
      fps: this.fps,
      resolution: this.resolution,
      isRealtime: true,
    };
  }
}
