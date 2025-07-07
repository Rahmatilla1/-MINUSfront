import { useInfoContext } from './context/Context';
import Auth from './pages/Auth/Auth';
import Chat from './pages/Chat/Chat';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { ToastContainer, } from 'react-toastify';
import { useEffect } from 'react';
import axios from "axios";

const App = () => {

  useEffect(() => {
    const subscribeUser = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          const existingSub = await registration.pushManager.getSubscription();
          if (!existingSub) {
            const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

            const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey
            });

            // Backendga yuborish
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/push/subscribe`, subscription);
            console.log("✅ Push subscription saqlandi.");
          }
        } catch (err) {
          console.error("❌ Push subscription xatosi:", err);
        }
      }
    };

    subscribeUser();
  }, []);

  // 🔄 VAPID kalitini yuborish uchun konvert funksiyasi
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

    
  const {currentUser} = useInfoContext();


  return (
    <div className="App">
      {
        currentUser ? <Chat /> : <Auth />
      }

      <ToastContainer/>

      <div className="blur"></div>
    </div>
  );
}

export default App;