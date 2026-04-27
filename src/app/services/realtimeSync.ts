// Real-time data synchronization service
import { useEffect, useRef, useState } from 'react';

export interface SyncEvent {
  type: 'transaction_created' | 'transaction_updated' | 'transaction_deleted' | 'data_conflict';
  data: any;
  timestamp: string;
  userId?: string;
}

export interface ConflictResolution {
  strategy: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
  localData: any;
  remoteData: any;
  field: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, ((event: SyncEvent) => void)> = new Map();
  private isConnecting = false;

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const syncEvent: SyncEvent = JSON.parse(event.data);
            this.notifyListeners(syncEvent);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnecting = false;
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(eventType: string, callback: (event: SyncEvent) => void): () => void {
    const key = `${eventType}_${Date.now()}_${Math.random()}`;
    this.listeners.set(key, callback);
    
    return () => {
      this.listeners.delete(key);
    };
  }

  private notifyListeners(event: SyncEvent) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  send(event: Partial<SyncEvent>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullEvent: SyncEvent = {
        ...event,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(fullEvent));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Hook for real-time data synchronization
export function useRealTimeSync(url: string = 'ws://localhost:8080') {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SyncEvent | null>(null);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    const wsService = new WebSocketService(url);
    wsRef.current = wsService;

    wsService.connect()
      .then(() => {
        setIsConnected(true);
      })
      .catch(error => {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      });

    // Subscribe to events
    const unsubscribeCreated = wsService.subscribe('transaction_created', (event) => {
      setLastEvent(event);
      // Handle new transaction
    });

    const unsubscribeUpdated = wsService.subscribe('transaction_updated', (event) => {
      setLastEvent(event);
      // Handle updated transaction
    });

    const unsubscribeDeleted = wsService.subscribe('transaction_deleted', (event) => {
      setLastEvent(event);
      // Handle deleted transaction
    });

    const unsubscribeConflict = wsService.subscribe('data_conflict', (event) => {
      setLastEvent(event);
      if (event.type === 'data_conflict') {
        setConflicts(prev => [...prev, event.data as ConflictResolution]);
      }
    });

    // Monitor connection status
    const statusInterval = setInterval(() => {
      setIsConnected(wsService.isConnected());
    }, 1000);

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeConflict();
      clearInterval(statusInterval);
      wsService.disconnect();
    };
  }, [url]);

  const sendEvent = (event: Partial<SyncEvent>) => {
    if (wsRef.current) {
      wsRef.current.send(event);
    }
  };

  const resolveConflict = (conflict: ConflictResolution, resolution: ConflictResolution['strategy']) => {
    // Send resolution to server
    sendEvent({
      type: 'conflict_resolved',
      data: { ...conflict, strategy: resolution }
    });
    
    // Remove from local conflicts
    setConflicts(prev => prev.filter(c => c !== conflict));
  };

  return {
    isConnected,
    lastEvent,
    conflicts,
    sendEvent,
    resolveConflict
  };
}

// Offline mode with sync capabilities
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    const stored = localStorage.getItem('pendingSyncActions');
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }

    const storedSyncTime = localStorage.getItem('lastSyncTime');
    if (storedSyncTime) {
      setLastSyncTime(new Date(storedSyncTime));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addPendingAction = (action: any) => {
    const newActions = [...pendingActions, { ...action, timestamp: new Date().toISOString() }];
    setPendingActions(newActions);
    localStorage.setItem('pendingSyncActions', JSON.stringify(newActions));
  };

  const syncPendingActions = async () => {
    if (pendingActions.length === 0) return;

    try {
      // Here you would sync with your backend
      for (const action of pendingActions) {
        await syncAction(action);
      }
      
      setPendingActions([]);
      localStorage.removeItem('pendingSyncActions');
      setLastSyncTime(new Date());
      localStorage.setItem('lastSyncTime', new Date().toISOString());
    } catch (error) {
      console.error('Failed to sync pending actions:', error);
    }
  };

  const syncAction = async (action: any) => {
    // Implement your sync logic here
    // This would make API calls to sync the action
    console.log('Syncing action:', action);
  };

  return {
    isOnline,
    pendingActions,
    lastSyncTime,
    addPendingAction,
    syncPendingActions
  };
}
