export interface UploadImageResponseData {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface UploadImageResponse {
  code: number;
  message: string;
  data: UploadImageResponseData;
  timestamp: number;
}

export interface UploadImageRequest {
  token: string;
  file: Buffer;
  contentType: string;
}