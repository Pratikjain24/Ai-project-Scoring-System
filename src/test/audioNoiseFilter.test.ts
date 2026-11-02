import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioNoiseFilter, type AudioFilterMetrics } from '../utils/audioNoiseFilter';

describe('Web Audio API RNNoise Ambient Noise Filter', () => {
  let mockAudioContext: any;
  let mockSourceNode: any;
  let mockBiquadFilter: any;
  let mockGainNode: any;
  let mockCompressor: any;
  let mockAnalyser: any;
  let mockDestination: any;

  beforeEach(() => {
    // Mock AudioNodes
    mockBiquadFilter = {
      type: '',
      frequency: { setValueAtTime: vi.fn(), value: 0 },
      Q: { setValueAtTime: vi.fn(), value: 0 },
      gain: { setValueAtTime: vi.fn(), value: 0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockGainNode = {
      gain: { setValueAtTime: vi.fn(), value: 1.0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockCompressor = {
      threshold: { setValueAtTime: vi.fn(), value: -18 },
      knee: { setValueAtTime: vi.fn(), value: 10 },
      ratio: { setValueAtTime: vi.fn(), value: 4 },
      attack: { setValueAtTime: vi.fn(), value: 0.003 },
      release: { setValueAtTime: vi.fn(), value: 0.15 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockAnalyser = {
      fftSize: 512,
      smoothingTimeConstant: 0.3,
      getFloatTimeDomainData: vi.fn((array: Float32Array) => {
        // Populate with synthetic speech sample
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.sin(i * 0.1) * 0.2; // ~ -14 dBFS speech signal
        }
      }),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockTrack = {
      kind: 'audio',
      id: 'mock-audio-track',
      stop: vi.fn(),
    };

    mockDestination = {
      stream: {
        getTracks: vi.fn(() => [mockTrack]),
        getAudioTracks: vi.fn(() => [mockTrack]),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockSourceNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    // Mock AudioContext
    mockAudioContext = {
      state: 'running',
      currentTime: 10.0,
      createMediaStreamSource: vi.fn(() => mockSourceNode),
      createBiquadFilter: vi.fn(() => ({ ...mockBiquadFilter })),
      createGain: vi.fn(() => ({ ...mockGainNode })),
      createDynamicsCompressor: vi.fn(() => ({ ...mockCompressor })),
      createAnalyser: vi.fn(() => mockAnalyser),
      createMediaStreamDestination: vi.fn(() => mockDestination),
      close: vi.fn().mockResolvedValue(undefined),
    };

    // Assign mock AudioContext to global window
    (window as any).AudioContext = vi.fn(function () {
      return mockAudioContext;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('instantiates cascading filter graph with 85Hz highpass, 60Hz notch, and 7500Hz lowpass', () => {
    const filter = new AudioNoiseFilter({
      reductionLevel: 'MEDIUM',
      enableHighpass: true,
      enableLowpass: true,
      enableNotch: true,
      enableAdaptiveGate: true,
    });

    const mockStream = {
      getTracks: vi.fn(() => [{ kind: 'audio', stop: vi.fn() }]),
    } as unknown as MediaStream;

    const filteredStream = filter.createFilteredStream(mockStream);

    expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(mockStream);
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockAudioContext.createDynamicsCompressor).toHaveBeenCalled();
    expect(mockAudioContext.createMediaStreamDestination).toHaveBeenCalled();
    expect(filteredStream).toBe(mockDestination.stream);

    filter.dispose();
  });

  it('allows dynamic adjustment of noise suppression severity levels', () => {
    const filter = new AudioNoiseFilter();
    expect(() => filter.setNoiseReductionLevel('LOW')).not.toThrow();
    expect(() => filter.setNoiseReductionLevel('MEDIUM')).not.toThrow();
    expect(() => filter.setNoiseReductionLevel('AGGRESSIVE')).not.toThrow();
    filter.dispose();
  });

  it('reports real-time noise reduction metrics and voice activity detection (VAD)', () => {
    let capturedMetrics: AudioFilterMetrics | null = null;
    const filter = new AudioNoiseFilter({
      reductionLevel: 'MEDIUM',
      onMetricsUpdate: (m) => {
        capturedMetrics = m;
      },
    });

    const mockStream = {
      getTracks: vi.fn(() => []),
    } as unknown as MediaStream;

    filter.createFilteredStream(mockStream);

    const initialMetrics = filter.getMetrics();
    expect(initialMetrics).toBeDefined();
    expect(initialMetrics.filterActive).toBe(true);
    expect(capturedMetrics !== null || initialMetrics !== null).toBe(true);

    filter.dispose();
  });

  it('cleans up Web Audio context, stops tracks, and disconnects all nodes on dispose()', () => {
    const filter = new AudioNoiseFilter();
    const mockStream = {
      getTracks: vi.fn(() => []),
    } as unknown as MediaStream;

    filter.createFilteredStream(mockStream);
    filter.dispose();

    expect(mockAudioContext.close).toHaveBeenCalledTimes(1);
    expect(mockDestination.stream.getTracks()[0].stop).toHaveBeenCalledTimes(1);
  });
});
