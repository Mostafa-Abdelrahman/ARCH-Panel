import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Trash2, Mail, MailOpen, Download } from 'lucide-react';

const ContactMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await api.getContactMessages();
      
      // Handle the API response format: { success: true, data: [...] }
      let messageData: any[] = [];
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          messageData = (response as any).data || [];
        } else if (Array.isArray(response)) {
          messageData = response;
        }
      }
      
      // Ensure it's an array
      if (Array.isArray(messageData)) {
        setMessages(messageData);
      } else {
        console.error('Expected array but got:', messageData);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
      handleApiError(error);
      setMessages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markMessageAsRead(id);
      toast({ title: 'Success', description: 'Message marked as read' });
      loadMessages();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await api.deleteContactMessage(id);
      toast({ title: 'Success', description: 'Message deleted successfully' });
      loadMessages();
    } catch (error) {
      handleApiError(error);
    }
  };

  const exportToCSV = () => {
    if (!Array.isArray(messages) || messages.length === 0) {
      toast({ title: 'Warning', description: 'No messages to export' });
      return;
    }

    const headers = ['Name', 'Email', 'Subject', 'Message', 'Date', 'Status'];
    const rows = messages.map(m => [
      m.name,
      m.email,
      m.subject || '',
      m.message,
      new Date(m.createdAt).toLocaleString(),
      m.isRead ? 'Read' : 'Unread',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-messages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: 'Success', description: 'Messages exported to CSV' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground mt-1">
            {Array.isArray(messages) ? messages.filter(m => !m.isRead).length : 0} unread messages
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="space-y-4">
        {!Array.isArray(messages) || messages.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No messages yet
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className={!message.isRead ? 'border-l-4 border-l-primary' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {message.isRead ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Mail className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <h3 className="font-semibold">{message.name}</h3>
                      <p className="text-sm text-muted-foreground">{message.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={message.isRead ? 'secondary' : 'default'}>
                      {message.isRead ? 'Read' : 'Unread'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {message.subject && (
                  <h4 className="font-medium mb-2">{message.subject}</h4>
                )}

                <p className="text-sm text-muted-foreground mb-4">{message.message}</p>

                <div className="flex gap-2">
                  {!message.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(message.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(message.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactMessages;
