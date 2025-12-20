export class ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;

  constructor(code: number, message: string, data?: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
  }

  static success<T>(data?: T, message = 'success'): ApiResponse<T> {
    return new ApiResponse(200, message, data);
  }

  static error(code: number, message: string): ApiResponse {
    return new ApiResponse(code, message);
  }
}

