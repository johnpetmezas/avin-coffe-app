import React, { useEffect } from 'react';
import { CustomerView } from './components/CustomerView';
import { useOrders } from './hooks/useOrders';
import { usePushNotifications } from './hooks/usePushNotifications';
import { NotificationOnboarding } from './components/NotificationOnboarding';
import { Order } from './types';

export default function App() {
  const {
    orders,
    activeOrder,
    loading,
    addOrder,
    editOrder,
    cancelOrder,
    deleteOrder,
    isFirebaseReady
  } = useOrders();

  // Initialize push notification hook linked to the active order
  const { permission, requestPermission } = usePushNotifications(activeOrder?.id || null);

  // Grace period timer: local trigger if offline, but Firestore handles state synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      // Offline fallback grace period or active tracking could happen here
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const history = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-[#C2A382] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-[0.2em] font-black text-white/50 animate-pulse">
          AVIN COFFEE EXPERIENCE - Φορτωση...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#1A1A1A]">
      {/* Customer View */}
      <CustomerView
        onPlaceOrder={addOrder}
        onEditOrder={editOrder}
        activeOrder={activeOrder}
        history={history}
        onCancelOrder={cancelOrder}
        onDeleteOrder={deleteOrder}
      />

      {/* Push Notification Onboarding Prompt */}
      {activeOrder && (
        <NotificationOnboarding
          onPermissionRequested={requestPermission}
          activeOrderId={activeOrder.id}
        />
      )}
    </div>
  );
}
