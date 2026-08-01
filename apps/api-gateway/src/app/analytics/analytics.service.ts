import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

export interface AnalyticsEvent {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService implements OnApplicationShutdown {
  private readonly logger = new Logger(AnalyticsService.name);

  private readonly client: PostHog | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('POSTHOG_API_KEY');

    const host = this.configService.get<string>('POSTHOG_HOST');

    if (!apiKey || !host) {
      this.client = null;

      this.logger.warn(
        'PostHog is disabled because its configuration is missing',
      );

      return;
    }

    this.client = new PostHog(apiKey, {
      host,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  capture({ distinctId, event, properties }: AnalyticsEvent): void {
    if (!this.client) {
      return;
    }

    this.client.capture({
      distinctId,
      event,
      properties,
    });
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.client.shutdown();
  }
}
