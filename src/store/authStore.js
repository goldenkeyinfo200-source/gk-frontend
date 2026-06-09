import { create } from 'zustand'

const useAuthStore = create((set) => ({
  agent: (() => {
    try { return JSON.parse(localStorage.getItem('gk_agent')) } catch { return null }
  })(),
  token: localStorage.getItem('gk_token') || null,

  setAuth: (token, agent) => {
    localStorage.setItem('gk_token', token)
    localStorage.setItem('gk_agent', JSON.stringify(agent))
    set({ token, agent })
  },

  logout: () => {
    localStorage.removeItem('gk_token')
    localStorage.removeItem('gk_agent')
    set({ token: null, agent: null })
  },
}))

export default useAuthStore
