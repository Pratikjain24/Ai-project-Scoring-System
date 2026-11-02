// ====================================================
// PROJECTX-RAY AI - TELEMETRY SLIDING WINDOW RING BUFFER
// Fixed-Size Bounded Memory Buffer with FIFO Eviction
// Eliminates In-Memory Telemetry Accumulation (Bug #5)
// ====================================================

import type { LivePresenterTrackingMetrics, PresenterGazeStatus, PresenterPostureStatus } from '../models/liveJury';

export interface RingBufferStats {
  size: number;
  capacity: number;
  totalPushed: number;
  evictedCount: number;
  oldestTimestampMs?: number;
  newestTimestampMs?: number;
  windowDurationSeconds?: number;
}

export interface PresenterTelemetrySummary {
  sampleCount: number;
  totalSessionSamples: number;
  evictedSamples: number;
  bufferCapacity: number;
  averageEyeContactScore: number;
  averagePostureStability: number;
  gazeDistribution: {
    directCount: number;
    directPct: number;
    lookingDownCount: number;
    lookingDownPct: number;
    lookingAwayCount: number;
    lookingAwayPct: number;
  };
  postureDistribution: Record<PresenterPostureStatus, number>;
  latestSlideNumber: number;
  averagePitch: number;
  averageYaw: number;
  presenterCount?: number;
  activePresenterId?: number;
  speakingDistribution?: Record<number, number>;
  teamSpeakingBalanceScore?: number;
}

export interface TelemetryRingBufferOptions {
  maxSize?: number;
}

/**
 * High-performance circular ring buffer with fixed capacity and FIFO eviction.
 * Guarantees O(1) push, O(1) peek, and bounded memory footprint for high-frequency
 * 500ms live telemetry streams, preventing memory leaks over extended evaluation sessions.
 */
export class TelemetryRingBuffer<T> {
  public readonly capacity: number;
  private readonly buffer: (T | undefined)[];
  private readonly timestamps: number[];
  private head: number = 0; // index of the oldest valid element
  private count: number = 0; // current number of stored elements
  private _totalPushed: number = 0;
  private _evictedCount: number = 0;

  constructor(options: TelemetryRingBufferOptions = {}) {
    this.capacity = options.maxSize && options.maxSize > 0 ? options.maxSize : 100;
    this.buffer = new Array<T | undefined>(this.capacity);
    this.timestamps = new Array<number>(this.capacity);
  }

  /**
   * Current number of elements stored in the buffer (<= capacity).
   */
  get size(): number {
    return this.count;
  }

  /**
   * Total number of elements pushed into the buffer over its lifetime.
   */
  get totalPushed(): number {
    return this._totalPushed;
  }

  /**
   * Total number of elements evicted via FIFO sliding window policy.
   */
  get evictedCount(): number {
    return this._evictedCount;
  }

  /**
   * Check if buffer is completely full.
   */
  get isFull(): boolean {
    return this.count === this.capacity;
  }

  /**
   * Check if buffer is empty.
   */
  get isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * Pushes a new item into the ring buffer.
   * If capacity is reached, the oldest element is evicted (FIFO) in O(1) time.
   * Returns the evicted element if eviction occurred, or undefined.
   */
  push(item: T, timestampMs = Date.now()): T | undefined {
    let evicted: T | undefined = undefined;

    if (this.count === this.capacity) {
      // Buffer full: evict oldest item at head
      evicted = this.buffer[this.head];
      this.buffer[this.head] = item;
      this.timestamps[this.head] = timestampMs;
      this.head = (this.head + 1) % this.capacity;
      this._evictedCount++;
    } else {
      // Buffer has room
      const writeIndex = (this.head + this.count) % this.capacity;
      this.buffer[writeIndex] = item;
      this.timestamps[writeIndex] = timestampMs;
      this.count++;
    }

    this._totalPushed++;
    return evicted;
  }

  /**
   * Returns the newest element in O(1) time without removing it.
   */
  getLatest(): T | undefined {
    if (this.count === 0) return undefined;
    const lastIndex = (this.head + this.count - 1) % this.capacity;
    return this.buffer[lastIndex];
  }

  /**
   * Returns the oldest element in O(1) time without removing it.
   */
  getOldest(): T | undefined {
    if (this.count === 0) return undefined;
    return this.buffer[this.head];
  }

  /**
   * Returns all stored items in chronological order (oldest to newest).
   */
  toArray(): T[] {
    const result: T[] = new Array<T>(this.count);
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.capacity;
      result[i] = this.buffer[idx]!;
    }
    return result;
  }

  /**
   * Returns the most recent N items in chronological order.
   */
  getRecent(limit?: number): T[] {
    if (!limit || limit >= this.count) {
      return this.toArray();
    }
    const result: T[] = new Array<T>(limit);
    const startOffset = this.count - limit;
    for (let i = 0; i < limit; i++) {
      const idx = (this.head + startOffset + i) % this.capacity;
      result[i] = this.buffer[idx]!;
    }
    return result;
  }

  /**
   * Computes mathematical rolling average across all elements using selector.
   */
  getAverage(selector: (item: T) => number): number {
    if (this.count === 0) return 0;
    let sum = 0;
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.capacity;
      sum += selector(this.buffer[idx]!);
    }
    return Math.round((sum / this.count) * 100) / 100;
  }

  /**
   * Empties the ring buffer and resets counters.
   */
  clear(): void {
    this.buffer.fill(undefined);
    this.timestamps.fill(0);
    this.head = 0;
    this.count = 0;
    this._totalPushed = 0;
    this._evictedCount = 0;
  }

  /**
   * Returns telemetry buffer diagnostics.
   */
  getStats(): RingBufferStats {
    let oldestTimestampMs: number | undefined = undefined;
    let newestTimestampMs: number | undefined = undefined;
    let windowDurationSeconds: number | undefined = undefined;

    if (this.count > 0) {
      oldestTimestampMs = this.timestamps[this.head];
      const newestIndex = (this.head + this.count - 1) % this.capacity;
      newestTimestampMs = this.timestamps[newestIndex];
      windowDurationSeconds = Math.max(0, Math.round((newestTimestampMs - oldestTimestampMs) / 1000));
    }

    return {
      size: this.count,
      capacity: this.capacity,
      totalPushed: this._totalPushed,
      evictedCount: this._evictedCount,
      oldestTimestampMs,
      newestTimestampMs,
      windowDurationSeconds
    };
  }
}

/**
 * Summarizes a presenter visual telemetry ring buffer into rich statistical indicators.
 */
export function summarizePresenterMetrics(
  buffer: TelemetryRingBuffer<LivePresenterTrackingMetrics>
): PresenterTelemetrySummary | undefined {
  if (buffer.isEmpty) return undefined;

  const items = buffer.toArray();
  const sampleCount = items.length;

  let eyeContactSum = 0;
  let postureStabilitySum = 0;
  let pitchSum = 0;
  let yawSum = 0;

  let directCount = 0;
  let lookingDownCount = 0;
  let lookingAwayCount = 0;

  const postureDistribution: Record<PresenterPostureStatus, number> = {
    UPRIGHT: 0,
    LEANING_FORWARD: 0,
    LEANING_BACK: 0,
    SLUMPED: 0
  };

  let latestSlideNumber = 1;

  for (const item of items) {
    eyeContactSum += item.eyeContactScore;
    postureStabilitySum += item.postureStability;
    pitchSum += item.headPose.pitch;
    yawSum += item.headPose.yaw;

    if (item.gazeStatus === 'DIRECT') directCount++;
    else if (item.gazeStatus === 'LOOKING_DOWN') lookingDownCount++;
    else if (item.gazeStatus === 'LOOKING_AWAY') lookingAwayCount++;

    if (item.postureStatus && postureDistribution[item.postureStatus] !== undefined) {
      postureDistribution[item.postureStatus]++;
    }

    if (item.slideNumber && item.slideNumber > latestSlideNumber) {
      latestSlideNumber = item.slideNumber;
    }
  }

  const latest = buffer.getLatest();
  if (latest?.slideNumber) {
    latestSlideNumber = latest.slideNumber;
  }

  return {
    sampleCount,
    totalSessionSamples: buffer.totalPushed,
    evictedSamples: buffer.evictedCount,
    bufferCapacity: buffer.capacity,
    averageEyeContactScore: Math.round((eyeContactSum / sampleCount) * 10) / 10,
    averagePostureStability: Math.round((postureStabilitySum / sampleCount) * 10) / 10,
    gazeDistribution: {
      directCount,
      directPct: Math.round((directCount / sampleCount) * 100),
      lookingDownCount,
      lookingDownPct: Math.round((lookingDownCount / sampleCount) * 100),
      lookingAwayCount,
      lookingAwayPct: Math.round((lookingAwayCount / sampleCount) * 100)
    },
    postureDistribution,
    latestSlideNumber,
    averagePitch: Math.round((pitchSum / sampleCount) * 10) / 10,
    averageYaw: Math.round((yawSum / sampleCount) * 10) / 10,
    presenterCount: latest?.presenterCount ?? 1,
    activePresenterId: latest?.activePresenterId ?? 1,
    speakingDistribution: latest?.speakingDistribution,
    teamSpeakingBalanceScore: latest?.teamSpeakingBalanceScore ?? 100
  };
}

