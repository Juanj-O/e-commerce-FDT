import type { RootState } from '../../app/store'
import notificationsReducer, {
  addNotification,
  clearNotifications,
  removeNotification,
  selectNotifications
} from './notificationSlice'

describe('notificationSlice', () => {
  const initialState = {
    notifications: []
  }

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(notificationsReducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })

    it('should add a notification', () => {
      const notification = {
        message: 'Test message',
        type: 'success' as const,
        duration: 3000
      }
      const state = notificationsReducer(initialState, addNotification(notification))

      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0].message).toBe('Test message')
      expect(state.notifications[0].type).toBe('success')
      expect(state.notifications[0].duration).toBe(3000)
      expect(state.notifications[0].id).toBeDefined()
    })

    it('should add multiple notifications', () => {
      let state = notificationsReducer(
        initialState,
        addNotification({ message: 'First', type: 'info' })
      )
      state = notificationsReducer(state, addNotification({ message: 'Second', type: 'error' }))

      expect(state.notifications).toHaveLength(2)
      expect(state.notifications[0].message).toBe('First')
      expect(state.notifications[1].message).toBe('Second')
    })

    it('should remove a notification by id', () => {
      const stateWithNotifications = {
        notifications: [
          { id: '1', message: 'First', type: 'success' as const },
          { id: '2', message: 'Second', type: 'error' as const }
        ]
      }

      const state = notificationsReducer(stateWithNotifications, removeNotification('1'))

      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0].id).toBe('2')
    })

    it('should not affect state when removing non-existent notification', () => {
      const stateWithNotifications = {
        notifications: [{ id: '1', message: 'First', type: 'success' as const }]
      }

      const state = notificationsReducer(stateWithNotifications, removeNotification('999'))

      expect(state.notifications).toHaveLength(1)
    })

    it('should clear all notifications', () => {
      const stateWithNotifications = {
        notifications: [
          { id: '1', message: 'First', type: 'success' as const },
          { id: '2', message: 'Second', type: 'error' as const },
          { id: '3', message: 'Third', type: 'warning' as const }
        ]
      }

      const state = notificationsReducer(stateWithNotifications, clearNotifications())

      expect(state.notifications).toHaveLength(0)
    })

    it('should handle different notification types', () => {
      const types = ['success', 'error', 'warning', 'info'] as const

      types.forEach((type) => {
        const state = notificationsReducer(
          initialState,
          addNotification({ message: `Test ${type}`, type })
        )
        expect(state.notifications[0].type).toBe(type)
      })
    })
  })

  describe('selectors', () => {
    it('should select notifications', () => {
      const mockState = {
        notifications: {
          notifications: [{ id: '1', message: 'Test', type: 'success' as const }]
        }
      } as unknown as RootState

      const notifications = selectNotifications(mockState)
      expect(notifications).toHaveLength(1)
      expect(notifications[0].message).toBe('Test')
    })

    it('should return empty array when no notifications', () => {
      const mockState = {
        notifications: {
          notifications: []
        }
      } as unknown as RootState

      const notifications = selectNotifications(mockState)
      expect(notifications).toHaveLength(0)
    })
  })
})
