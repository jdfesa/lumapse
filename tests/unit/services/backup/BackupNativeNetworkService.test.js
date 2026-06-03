import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Network } from '@capacitor/network'
import {
  getCurrentBackupNetworkState,
  onBackupNetworkStateChange,
} from '../../../../src/services/backup/BackupNativeNetworkService.js'

vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: vi.fn(),
    addListener: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
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

    it('rechaza si no recibe listener', async () => {
      await expect(onBackupNetworkStateChange()).rejects.toThrow('listener')
      expect(Network.addListener).not.toHaveBeenCalled()
    })
  })
})
