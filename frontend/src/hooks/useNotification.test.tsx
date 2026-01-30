import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import notificationsReducer from '../features/notifications/notificationSlice'
import { useNotification } from './useNotification'

const createWrapper = () => {
  const store = configureStore({
    reducer: {
      notifications: notificationsReducer
    }
  })

  return ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>
}

describe('useNotification', () => {
  it('should provide notification functions', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: createWrapper()
    })

    expect(result.current.showNotification).toBeDefined()
    expect(result.current.showSuccess).toBeDefined()
    expect(result.current.showError).toBeDefined()
    expect(result.current.showWarning).toBeDefined()
    expect(result.current.showInfo).toBeDefined()
  })

  it('should call showNotification with correct parameters', () => {
    const store = configureStore({
      reducer: {
        notifications: notificationsReducer
      }
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useNotification(), { wrapper })

    result.current.showNotification({
      message: 'Test notification',
      type: 'info',
      duration: 3000
    })

    const state = store.getState()
    expect(state.notifications.notifications).toHaveLength(1)
    expect(state.notifications.notifications[0].message).toBe('Test notification')
    expect(state.notifications.notifications[0].type).toBe('info')
  })

  it('should use default type and duration when not provided', () => {
    const store = configureStore({
      reducer: {
        notifications: notificationsReducer
      }
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useNotification(), { wrapper })

    result.current.showNotification({ message: 'Test' })

    const state = store.getState()
    expect(state.notifications.notifications[0].type).toBe('info')
  })

  describe('showSuccess', () => {
    it('should add success notification with default duration', () => {
      const store = configureStore({
        reducer: {
          notifications: notificationsReducer
        }
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useNotification(), { wrapper })

      result.current.showSuccess('Success message')

      const state = store.getState()
      expect(state.notifications.notifications).toHaveLength(1)
      expect(state.notifications.notifications[0].message).toBe('Success message')
      expect(state.notifications.notifications[0].type).toBe('success')
    })

    it('should add success notification with custom duration', () => {
      const store = configureStore({
        reducer: {
          notifications: notificationsReducer
        }
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useNotification(), { wrapper })

      result.current.showSuccess('Success message', 5000)

      const state = store.getState()
      expect(state.notifications.notifications[0].type).toBe('success')
    })
  })

  describe('showError', () => {
    it('should add error notification', () => {
      const store = configureStore({
        reducer: {
          notifications: notificationsReducer
        }
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useNotification(), { wrapper })

      result.current.showError('Error message')

      const state = store.getState()
      expect(state.notifications.notifications).toHaveLength(1)
      expect(state.notifications.notifications[0].message).toBe('Error message')
      expect(state.notifications.notifications[0].type).toBe('error')
    })

    it('should add error notification with custom duration', () => {
      const store = configureStore({
        reducer: {
          notifications: notificationsReducer
        }
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useNotification(), { wrapper })

      result.current.showError('Error message', 10000)

      const state = store.getState()
      expect(state.notifications.notifications[0].type).toBe('error')
    })
  })

  describe('showWarning', () => {
    it('should add warning notification', () => {
      const store = configureStore({
        reducer: {
          notifications: notificationsReducer
        }
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useNotification(), { wrapper })

      result.current.showWarning('Warning message')

      const state = store.getState()
      expect(state.notifications.notifications).toHaveLength(1)
      expect(state.notifications.notifications[0].message).toBe('Warning message')
      expect(state.notifications.notifications[0].type).toBe('warning')
    })

    it('should add warning notification with custom duration', () => {
      const store = configureStore({
        reducer: {
          notifications: notificationsReducer
        }
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useNotification(), { wrapper })

      result.current.showWarning('Warning message', 7000)

      const state = store.getState()
      expect(state.notifications.notifications[0].type).toBe('warning')
    })
  })

  describe('showInfo', () => {
    it('should add info notification', () => {
      const store = configureStore({
        reducer: {
          notifications: notificationsReducer
        }
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useNotification(), { wrapper })

      result.current.showInfo('Info message')

      const state = store.getState()
      expect(state.notifications.notifications).toHaveLength(1)
      expect(state.notifications.notifications[0].message).toBe('Info message')
      expect(state.notifications.notifications[0].type).toBe('info')
    })

    it('should add info notification with custom duration', () => {
      const store = configureStore({
        reducer: {
          notifications: notificationsReducer
        }
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useNotification(), { wrapper })

      result.current.showInfo('Info message', 4000)

      const state = store.getState()
      expect(state.notifications.notifications[0].type).toBe('info')
    })
  })

  it('should handle multiple notifications', () => {
    const store = configureStore({
      reducer: {
        notifications: notificationsReducer
      }
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useNotification(), { wrapper })

    result.current.showSuccess('Success 1')
    result.current.showError('Error 1')
    result.current.showWarning('Warning 1')

    const state = store.getState()
    expect(state.notifications.notifications).toHaveLength(3)
    expect(state.notifications.notifications[0].type).toBe('success')
    expect(state.notifications.notifications[1].type).toBe('error')
    expect(state.notifications.notifications[2].type).toBe('warning')
  })
})
