import { beforeEach, describe, expect, it, vi } from 'vitest'

const { Network } = vi.hoisted(() => ({
  Network: {
    getStatus: vi.fn(),
    addListener: vi.fn(),
  },
}))

import {
  getCurrentBackupNetworkState,
  onBackupNetworkStateChange,
} from '../../../../src/services/backup/BackupNativeNetworkService.ts'

vi.mock('@capacitor/core', () => ({
  registerPlugin: vi.fn(() => Network),
}))

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(globalThis.navigator, 'onLine', {
    value: true,
    configurable: true,
  })
  Object.defineProperty(globalThis.navigator, 'connection', {
    value: undefined,
    configurable: true,
  })
})

describe('BackupNativeNetworkService', () => {
  describe('getCurrentBackupNetworkState()', () => {
    it('lee el estado real de Capacitor Network y lo traduce para backup', async () => {
      Network.getStatus.mockResolvedValue({
        connected: true,
        connectionType: 'wifi',
      })

      await expect(getCurrentBackupNetworkState()).resolves.toMatchObject({
        connected: true,
        externalBackupAllowed: true,
        recommended: true,
      })
      expect(Network.getStatus).toHaveBeenCalledTimes(1)
    })

    it('usa fallback web conservador si Capacitor Network no responde', async () => {
      Network.getStatus.mockRejectedValue(new Error('plugin no disponible'))
      Object.defineProperty(globalThis.navigator, 'connection', {
        value: { effectiveType: '4g' },
        configurable: true,
      })

      await expect(getCurrentBackupNetworkState()).resolves.toMatchObject({
        connected: true,
        connectionType: 'unknown',
        externalBackupAllowed: true,
        requiresWarning: true,
      })
    })
  })

  describe('onBackupNetworkStateChange()', () => {
    it('registra listener y entrega estados traducidos', async () => {
      const handle = { remove: vi.fn() }
      const listener = vi.fn()
      Network.addListener.mockImplementation(async (_eventName, callback) => {
        callback({
          connected: true,
          connectionType: 'cellular',
        })
        return handle
      })

      await expect(onBackupNetworkStateChange(listener)).resolves.toBe(handle)

      expect(Network.addListener).toHaveBeenCalledWith('networkStatusChange', expect.any(Function))
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        connected: true,
        connectionType: 'cellular',
        externalBackupAllowed: true,
        requiresWarning: true,
      }))
    })

    it('usa eventos web y permite removerlos si el listener nativo falla', async () => {
      const listener = vi.fn()
      Network.addListener.mockRejectedValue(new Error('plugin no disponible'))
      Object.defineProperty(globalThis.navigator, 'connection', {
        value: { type: 'wifi' },
        configurable: true,
      })

      const handle = await onBackupNetworkStateChange(listener)

      globalThis.window.dispatchEvent(new Event('offline'))
      globalThis.window.dispatchEvent(new Event('online'))

      expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({
        connected: false,
        connectionType: 'none',
      }))
      expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({
        connected: true,
        connectionType: 'wifi',
        recommended: true,
      }))

      await expect(handle.remove()).resolves.toBeUndefined()
    })

    it('rechaza si no recibe listener', async () => {
      await expect(onBackupNetworkStateChange()).rejects.toThrow('listener')
      expect(Network.addListener).not.toHaveBeenCalled()
    })
  })
})
