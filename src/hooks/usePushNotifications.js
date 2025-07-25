"use client"

import { useState, useEffect } from "react"
import ApiService from "../utils/api"

const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      initializeServiceWorker()
    }
  }, [])

  const initializeServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registered:", registration)

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        setSubscription(existingSubscription)
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error)
    }
  }

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY),
      })

      // Send subscription to server
      await ApiService.updatePushSubscription(subscription)

      setSubscription(subscription)
      setIsSubscribed(true)

      return subscription
    } catch (error) {
      console.error("Push subscription failed:", error)
      throw error
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        setSubscription(null)
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error("Push unsubscription failed:", error)
      throw error
    }
  }

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications")
    }

    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      return subscribeToPush()
    } else {
      throw new Error("Notification permission denied")
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
    requestPermission,
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default usePushNotifications;
