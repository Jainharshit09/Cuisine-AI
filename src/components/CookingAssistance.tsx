'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CookingAssistance() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);


  useEffect(() => {
    const socket = io('/', { path: '/api/socket' });
    
    socket.on('connect', () => {
      setIsConnected(true);
      toast.success('Real-time cooking assistance is active');
      socket.emit('cooking-assistance', { step: 1, ingredient: 'salt' });
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
      toast.error('Failed to connect to cooking assistance' );
    });

    socket.on('suggestion', (data: { message: string }) => {
      setSuggestions((prev) => [...prev, data.message]);
      toast.success( data.message);
    });

    socket.on('plan-update', (data) => {
      toast.success('Meal plan updated collaboratively');
    });

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Cooking Assistance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        <Button
          onClick={() => io().emit('cooking-assistance', { step: suggestions.length + 1, ingredient: 'pepper' })}
          disabled={!isConnected}
        >
          Request Next Suggestion
        </Button>
        <ul className="list-disc pl-5 mt-4">
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}