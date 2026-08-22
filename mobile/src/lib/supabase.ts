import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

console.log('Supabase URL:', supabaseUrl || 'MISSING')

// Use XMLHttpRequest explicitly — fetch polyfill has issues with RN new arch
const customFetch = (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const method = options?.method ?? 'GET'
    xhr.open(method, url.toString())

    // Set headers
    if (options?.headers) {
      const headers = options.headers as Record<string, string>
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })
    }

    xhr.onload = () => {
      const responseText = xhr.responseText
      resolve(new Response(responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: { 'content-type': xhr.getResponseHeader('content-type') ?? 'application/json' },
      }))
    }

    xhr.onerror = () => reject(new TypeError('Network request failed'))
    xhr.ontimeout = () => reject(new TypeError('Network request timed out'))
    xhr.timeout = 10000

    xhr.send(options?.body ? options.body as XMLHttpRequestBodyInit : null)
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: customFetch as typeof fetch,
  },
})