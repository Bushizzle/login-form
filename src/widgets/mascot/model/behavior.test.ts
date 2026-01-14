import { describe, it, expect } from 'vitest';
import {
  resolveStateWithVeryClose,
  resolveEyelidFromProximity,
} from './behavior';

describe('behavior', () => {
  describe('resolveStateWithVeryClose', () => {
    it('should return poke state when requested is poke', () => {
      const result = resolveStateWithVeryClose({
        current: 'neutral',
        requested: 'poke',
        isVeryClose: true,
        previousRequested: null,
      });

      expect(result.next).toBe('poke');
      expect(result.previousRequested).toBeNull();
    });

    it('should override with current state when very close and requested is not alert', () => {
      const result = resolveStateWithVeryClose({
        current: 'neutral',
        requested: 'relaxed',
        isVeryClose: true,
        previousRequested: null,
      });

      expect(result.next).toBe('neutral');
      expect(result.previousRequested).toBe('relaxed');
    });

    it('should return requested state when not very close', () => {
      const result = resolveStateWithVeryClose({
        current: 'neutral',
        requested: 'relaxed',
        isVeryClose: false,
        previousRequested: null,
      });

      expect(result.next).toBe('relaxed');
      expect(result.previousRequested).toBeNull();
    });

    it('should allow alert state when very close', () => {
      const result = resolveStateWithVeryClose({
        current: 'neutral',
        requested: 'alert',
        isVeryClose: true,
        previousRequested: null,
      });

      expect(result.next).toBe('alert');
      expect(result.previousRequested).toBeNull();
    });
  });

  describe('resolveEyelidFromProximity', () => {
    it('should return current state when poked', () => {
      const result = resolveEyelidFromProximity({
        current: 'closed',
        isPoked: true,
        isBlinking: false,
        isCursorClose: true,
        isExplicitlySquinting: false,
      });

      expect(result).toBe('closed');
    });

    it('should return current state when blinking', () => {
      const result = resolveEyelidFromProximity({
        current: 'blinking',
        isPoked: false,
        isBlinking: true,
        isCursorClose: true,
        isExplicitlySquinting: false,
      });

      expect(result).toBe('blinking');
    });

    it('should return squintingLight when cursor is close and not explicitly squinting', () => {
      const result = resolveEyelidFromProximity({
        current: 'open',
        isPoked: false,
        isBlinking: false,
        isCursorClose: true,
        isExplicitlySquinting: false,
      });

      expect(result).toBe('squintingLight');
    });

    it('should keep squinting when cursor is close and explicitly squinting', () => {
      const result = resolveEyelidFromProximity({
        current: 'squinting',
        isPoked: false,
        isBlinking: false,
        isCursorClose: true,
        isExplicitlySquinting: true,
      });

      expect(result).toBe('squinting');
    });

    it('should keep squintingLight when cursor is close and already squintingLight', () => {
      const result = resolveEyelidFromProximity({
        current: 'squintingLight',
        isPoked: false,
        isBlinking: false,
        isCursorClose: true,
        isExplicitlySquinting: false,
      });

      expect(result).toBe('squintingLight');
    });

    it('should return open when cursor is not close and not explicitly squinting', () => {
      const result = resolveEyelidFromProximity({
        current: 'squintingLight',
        isPoked: false,
        isBlinking: false,
        isCursorClose: false,
        isExplicitlySquinting: false,
      });

      expect(result).toBe('open');
    });

    it('should keep squinting when cursor is not close but explicitly squinting', () => {
      const result = resolveEyelidFromProximity({
        current: 'squinting',
        isPoked: false,
        isBlinking: false,
        isCursorClose: false,
        isExplicitlySquinting: true,
      });

      expect(result).toBe('squinting');
    });

    it('should return current state when cursor is not close and already open', () => {
      const result = resolveEyelidFromProximity({
        current: 'open',
        isPoked: false,
        isBlinking: false,
        isCursorClose: false,
        isExplicitlySquinting: false,
      });

      expect(result).toBe('open');
    });
  });
});

