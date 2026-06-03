import { describe, expect, it, vi } from 'vitest'
import {
  BACKUP_CONNECTION_TYPES,
  getBackupNetworkState,
  resolveBackupNetworkState,
} from '../../../../src/services/backup/BackupNetworkService.js'

describe('BackupNetworkService', () => {
  describe('getBackupNetworkState()', () => {
    it('habilita backup externo y marca WiFi como recomendado', () => {
      expect(getBackupNetworkState({
        connected: true,
        connectionType: 'wifi',
      })).toMatchObject({
        connected: true,
        connectionType: BACKUP_CONNECTION_TYPES.WIFI,
        externalBackupAllowed: true,
        recommended: true,
        requiresWarning: false,
      })
    })

    it('habilita backup externo con advertencia cuando usa datos moviles', () => {
      expect(getBackupNetworkState({
        connected: true,
        connectionType: 'cellular',
      })).toMatchObject({
        connected: true,
        connectionType: BACKUP_CONNECTION_TYPES.CELLULAR,
        externalBackupAllowed: true,
        recommended: false,
        requiresWarning: true,
      })
    })

    it('habilita con advertencia conservadora si el tipo de red es unknown', () => {
      const state = getBackupNetworkState({
        connected: true,
        connectionType: 'bluetooth',
      })

      expect(state).toMatchObject({
        connected: true,
        connectionType: BACKUP_CONNECTION_TYPES.UNKNOWN,
        externalBackupAllowed: true,
        recommended: false,
        requiresWarning: true,
      })
      expect(state.message).toContain('no se pudo identificar')
    })

    it('deshabilita backup externo sin conexion', () => {
      expect(getBackupNetworkState({
        connected: false,
        connectionType: 'none',
      })).toMatchObject({
        connected: false,
        connectionType: BACKUP_CONNECTION_TYPES.NONE,
        externalBackupAllowed: false,
        recommended: false,
        requiresWarning: false,
      })
    })

    it('trata connectionType none como offline aunque connected sea true', () => {
      expect(getBackupNetworkState({
        connected: true,
        connectionType: 'none',
      })).toMatchObject({
        connected: false,
        externalBackupAllowed: false,
      })
    })
  })

  describe('resolveBackupNetworkState()', () => {
    it('usa un proveedor async de estado de red', async () => {
      const readStatus = vi.fn().mockResolvedValue({
        connected: true,
        connectionType: 'wifi',
      })

      const state = await resolveBackupNetworkState(readStatus)

      expect(readStatus).toHaveBeenCalledTimes(1)
      expect(state.externalBackupAllowed).toBe(true)
      expect(state.recommended).toBe(true)
    })

    it('devuelve offline si no recibe proveedor', async () => {
      await expect(resolveBackupNetworkState()).resolves.toMatchObject({
        connected: false,
        externalBackupAllowed: false,
      })
    })
  })
})
