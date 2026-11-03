import { getDb, db } from '../db/database';
import type { LiveEvent, LiveObservation, LivePresenterTrackingMetrics } from '../models/liveJury';
import { createModuleLogger } from '../utils/logger';
import { createRedisClient, testRedisConnection } from '../pipeline/redisConfig';
import type Redis from 'ioredis';

const liveLogger = createModuleLogger('TelemetryBatchQueue');

export interface TelemetryBatchStats {
  flushIntervalMs: number;
  maxBatchSize: number;
  pendingEventsCount: number;
  pendingObservationsCount: number;
  pendingSessionUpdatesCount: number;
  totalIngestedFrames: number;
  totalBatchesFlushed: number;
  totalEventsFlushed: number;
  totalObservationsFlushed: number;
  totalIndividualWritesSaved: number;
  writeReductionPct: number;
  isWorkerRunning: boolean;
  mode: 'REDIS_STREAM' | 'IN_MEMORY';
  redisStreamActive: boolean;
  redisStreamKey: string;
}

export class TelemetryBatchQueue {
  private static instance: TelemetryBatchQueue | null = null;

  private flushIntervalMs: number = 5000;
  private maxBatchSize: number = 100;
  private flushTimer: NodeJS.Timeout | null = null;

  // In-memory queues
  private pendingEvents: LiveEvent[] = [];
  private pendingObservations: LiveObservation[] = [];
  private pendingSessionUpdates: Map<string, { currentElapsedSeconds: number }> = new Map();

  // Metrics tracking
  private totalIngestedFrames: number = 0;
  private totalBatchesFlushed: number = 0;
  private totalEventsFlushed: number = 0;
  private totalObservationsFlushed: number = 0;
  private totalIndividualWritesSaved: number = 0;

  // Redis Stream Integration
  private redisClient: Redis | null = null;
  private redisConnected: boolean = false;
  private readonly redisStreamKey: string = 'stream:live_telemetry';
  private redisInitAttempted: boolean = false;

  private constructor() {
    this.initRedisStream().catch(() => {});
  }

  public static getInstance(): TelemetryBatchQueue {
    if (!TelemetryBatchQueue.instance) {
      TelemetryBatchQueue.instance = new TelemetryBatchQueue();
    }
    return TelemetryBatchQueue.instance;
  }

  /**
   * Initializes Redis stream connection if Redis is active
   */
  public async initRedisStream(): Promise<boolean> {
    if (this.redisInitAttempted && this.redisConnected) return true;
    this.redisInitAttempted = true;

    try {
      const reachable = await testRedisConnection(800);
      if (reachable) {
        this.redisClient = createRedisClient();
        this.redisClient.on('connect', () => {
          this.redisConnected = true;
          liveLogger.info('TelemetryBatchQueue connected to Redis stream', {
            stream: this.redisStreamKey
          });
        });
        this.redisClient.on('error', () => {
          this.redisConnected = false;
        });
        await this.redisClient.connect().catch(() => {});
        this.redisConnected = true;
        return true;
      }
    } catch {
      this.redisConnected = false;
    }
    return false;
  }

  /**
   * Start the background worker that flushes buffered telemetry frames every interval (default 5s)
   */
  public startWorker(intervalMs: number = 5000): void {
    if (this.flushTimer) return;
    this.flushIntervalMs = intervalMs;

    this.flushTimer = setInterval(() => {
      try {
        this.flushSync();
      } catch (err: any) {
        liveLogger.error('Background worker failed to flush telemetry batch', { error: err?.message });
      }
    }, this.flushIntervalMs);

    // unref() ensures the timer does not block node process exit (tests, workers, CLI)
    if (this.flushTimer.unref) {
      this.flushTimer.unref();
    }

    liveLogger.info('Started background telemetry batch flush worker', {
      intervalMs: this.flushIntervalMs,
      maxBatchSize: this.maxBatchSize
    });
  }

  /**
   * Stop the background worker and perform a final synchronous flush
   */
  public stopWorker(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
      liveLogger.info('Stopped background telemetry batch flush worker');
    }

    try {
      this.flushSync();
    } catch (err: any) {
      liveLogger.error('Error during final flush in stopWorker', { error: err?.message });
    }
  }

  /**
   * Generate a unique LiveEvent object with timestamp
   */
  public createEvent(event: Omit<LiveEvent, 'id' | 'createdAt'>): LiveEvent {
    const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();
    return {
      id,
      createdAt,
      ...event
    };
  }

  /**
   * Generate a unique LiveObservation object with timestamp
   */
  public createObservation(obs: Omit<LiveObservation, 'id' | 'createdAt'>): LiveObservation {
    const id = `obs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();
    return {
      id,
      createdAt,
      ...obs
    };
  }

  /**
   * Enqueue a LiveEvent into the in-memory batch buffer
   */
  public enqueueEvent(event: LiveEvent): void {
    this.pendingEvents.push(event);
    if (this.pendingEvents.length >= this.maxBatchSize) {
      this.flushSync();
    }
  }

  /**
   * Enqueue a LiveObservation into the in-memory batch buffer
   */
  public enqueueObservation(obs: LiveObservation): void {
    this.pendingObservations.push(obs);
  }

  /**
   * Enqueue a session elapsed time progression update
   */
  public enqueueSessionElapsed(sessionId: string, elapsedSeconds: number): void {
    const existing = this.pendingSessionUpdates.get(sessionId);
    if (!existing || elapsedSeconds > existing.currentElapsedSeconds) {
      this.pendingSessionUpdates.set(sessionId, { currentElapsedSeconds: elapsedSeconds });
    }
  }

  /**
   * Records an ingested visual telemetry frame and publishes to Redis stream if active
   */
  public recordFrameIngested(
    sessionId: string,
    telemetry: LivePresenterTrackingMetrics,
    elapsedSeconds: number = 0
  ): void {
    this.totalIngestedFrames++;

    if (this.redisConnected && this.redisClient) {
      try {
        this.redisClient.xadd(
          this.redisStreamKey,
          'MAXLEN', '~', '5000',
          '*',
          'sessionId', sessionId,
          'elapsedSeconds', String(elapsedSeconds),
          'timestampMs', String(telemetry.timestampMs || Date.now()),
          'gazeStatus', telemetry.gazeStatus || 'DIRECT',
          'eyeContactScore', String(telemetry.eyeContactScore || 100),
          'postureStatus', telemetry.postureStatus || 'UPRIGHT',
          'slideNumber', String(telemetry.slideNumber || 1)
        ).catch(() => {});
      } catch {
        // Safe fail-open for Redis stream
      }
    }
  }

  /**
   * Read-through consistency: retrieves pending in-memory events for a session
   */
  public getPendingEvents(sessionId: string): LiveEvent[] {
    if (sessionId === 'any') {
      return [...this.pendingEvents];
    }
    return this.pendingEvents.filter(e => e.sessionId === sessionId);
  }

  /**
   * Read-through consistency: retrieves pending in-memory observations for a session
   */
  public getPendingObservations(sessionId: string): LiveObservation[] {
    if (sessionId === 'any') {
      return [...this.pendingObservations];
    }
    return this.pendingObservations.filter(o => o.sessionId === sessionId);
  }

  /**
   * Read-through consistency: retrieves pending in-memory elapsed seconds for a session
   */
  public getPendingSessionElapsed(sessionId: string): number | undefined {
    return this.pendingSessionUpdates.get(sessionId)?.currentElapsedSeconds;
  }

  /**
   * Synchronously flushes all pending events, observations, and session updates
   * to SQLite in a single atomic db.transaction.
   */
  public flushSync(): { eventsFlushed: number; observationsFlushed: number; sessionsUpdated: number } {
    if (
      this.pendingEvents.length === 0 &&
      this.pendingObservations.length === 0 &&
      this.pendingSessionUpdates.size === 0
    ) {
      return { eventsFlushed: 0, observationsFlushed: 0, sessionsUpdated: 0 };
    }

    const eventsToFlush = this.pendingEvents;
    const obsToFlush = this.pendingObservations;
    const sessionUpdatesToFlush = this.pendingSessionUpdates;

    // Reset pending buffers immediately to allow new frames while transaction completes
    this.pendingEvents = [];
    this.pendingObservations = [];
    this.pendingSessionUpdates = new Map();

    try {
      db.transaction(() => {
        const database = getDb();

        if (eventsToFlush.length > 0) {
          const insertEventStmt = database.prepare(`
            INSERT INTO live_events (
              id, session_id, timestamp_ms, timestamp_formatted, event_type,
              description, confidence, evidence_ids_json, metadata_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const ev of eventsToFlush) {
            insertEventStmt.run(
              ev.id,
              ev.sessionId,
              ev.timestampMs,
              ev.timestampFormatted,
              ev.eventType,
              ev.description,
              ev.confidence,
              JSON.stringify(ev.evidenceIds || []),
              JSON.stringify(ev.metadata || {}),
              ev.createdAt
            );
          }
        }

        if (obsToFlush.length > 0) {
          const insertObsStmt = database.prepare(`
            INSERT INTO live_observations (
              id, session_id, timestamp_ms, timestamp_formatted, category,
              title, description, severity, confidence, evidence_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const obs of obsToFlush) {
            insertObsStmt.run(
              obs.id,
              obs.sessionId,
              obs.timestampMs,
              obs.timestampFormatted,
              obs.category,
              obs.title,
              obs.description,
              obs.severity,
              obs.confidence,
              obs.evidenceId || null,
              obs.createdAt
            );
          }
        }

        if (sessionUpdatesToFlush.size > 0) {
          const updateSessionStmt = database.prepare(`
            UPDATE live_jury_sessions SET
              current_elapsed_seconds = MAX(current_elapsed_seconds, ?),
              updated_at = ?
            WHERE id = ?
          `);

          const nowIso = new Date().toISOString();
          for (const [sessId, update] of sessionUpdatesToFlush) {
            updateSessionStmt.run(
              update.currentElapsedSeconds,
              nowIso,
              sessId
            );
          }
        }
      });

      const individualWrites = eventsToFlush.length + obsToFlush.length + sessionUpdatesToFlush.size;
      this.totalBatchesFlushed += 1;
      this.totalEventsFlushed += eventsToFlush.length;
      this.totalObservationsFlushed += obsToFlush.length;
      this.totalIndividualWritesSaved += Math.max(0, individualWrites - 1);

      return {
        eventsFlushed: eventsToFlush.length,
        observationsFlushed: obsToFlush.length,
        sessionsUpdated: sessionUpdatesToFlush.size
      };
    } catch (err) {
      // Restore pending items so no telemetry is dropped on transient failure
      this.pendingEvents = [...eventsToFlush, ...this.pendingEvents];
      this.pendingObservations = [...obsToFlush, ...this.pendingObservations];
      for (const [sId, upd] of sessionUpdatesToFlush) {
        const existing = this.pendingSessionUpdates.get(sId);
        if (!existing || upd.currentElapsedSeconds > existing.currentElapsedSeconds) {
          this.pendingSessionUpdates.set(sId, upd);
        }
      }
      throw err;
    }
  }

  /**
   * Asynchronous flush helper
   */
  public async flush(): Promise<{ eventsFlushed: number; observationsFlushed: number; sessionsUpdated: number }> {
    return this.flushSync();
  }

  /**
   * Synchronously flushes all pending items for a specific session before session completion
   */
  public flushSessionSync(sessionId: string): { eventsFlushed: number; observationsFlushed: number; sessionsUpdated: number } {
    return this.flushSync();
  }

  /**
   * Computes the percentage of database write operations eliminated through batching
   */
  public getWriteReductionPct(): number {
    const totalPotentialWrites =
      this.totalEventsFlushed +
      this.totalObservationsFlushed +
      this.pendingEvents.length +
      this.pendingObservations.length +
      this.totalBatchesFlushed;

    if (totalPotentialWrites === 0) return 0;

    const actualWrites = this.totalBatchesFlushed || (this.pendingEvents.length > 0 ? 0 : 1);
    const reduction = ((totalPotentialWrites - actualWrites) / totalPotentialWrites) * 100;
    return Math.max(0, Math.min(100, Number(reduction.toFixed(1))));
  }

  /**
   * Current statistics and health metrics for the batch queue
   */
  public getStats(): TelemetryBatchStats {
    return {
      flushIntervalMs: this.flushIntervalMs,
      maxBatchSize: this.maxBatchSize,
      pendingEventsCount: this.pendingEvents.length,
      pendingObservationsCount: this.pendingObservations.length,
      pendingSessionUpdatesCount: this.pendingSessionUpdates.size,
      totalIngestedFrames: this.totalIngestedFrames,
      totalBatchesFlushed: this.totalBatchesFlushed,
      totalEventsFlushed: this.totalEventsFlushed,
      totalObservationsFlushed: this.totalObservationsFlushed,
      totalIndividualWritesSaved: this.totalIndividualWritesSaved,
      writeReductionPct: this.getWriteReductionPct(),
      isWorkerRunning: this.flushTimer !== null,
      mode: this.redisConnected ? 'REDIS_STREAM' : 'IN_MEMORY',
      redisStreamActive: this.redisConnected,
      redisStreamKey: this.redisStreamKey
    };
  }

  /**
   * Clears pending queues and resets metrics (primarily for test fixture isolation)
   */
  public clear(): void {
    this.pendingEvents = [];
    this.pendingObservations = [];
    this.pendingSessionUpdates.clear();
    this.totalIngestedFrames = 0;
    this.totalBatchesFlushed = 0;
    this.totalEventsFlushed = 0;
    this.totalObservationsFlushed = 0;
    this.totalIndividualWritesSaved = 0;
  }
}

