import { Injectable, OnModuleInit } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { TraceService } from "./trace.service";

@Injectable()
export class AxiosTraceInterceptor implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly traceService: TraceService
  ) {}

  onModuleInit(): void {
    this.httpService.axiosRef.interceptors.request.use((config) => {
      const traceId = this.traceService.getOrCreateTraceId();
      config.headers = config.headers ?? {};
      config.headers["X-Trace-Id"] = traceId;
      return config;
    });
  }
}
