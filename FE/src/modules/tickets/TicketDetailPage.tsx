import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Lock, Globe, Send } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getTicket, listComments, createComment, updateTicketStatus } from './api';
import { StatusBadge } from './components/StatusBadge';
import { PriorityBadge } from './components/PriorityBadge';
import { SlaTimer } from './components/SlaTimer';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { queryClient } from '@/lib/queryClient';
import { useUiStore } from '@/store/uiStore';

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' }, { value: 'OPEN', label: 'Open' },
  { value: 'PENDING', label: 'Pending' }, { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'SOLVED', label: 'Solved' }, { value: 'CLOSED', label: 'Closed' },
];

export default function TicketDetailPage() {
  const { orgId, ticketId } = useParams<{ orgId: string; ticketId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addToast = useUiStore((s) => s.addToast);
  const socket = useSocket();
  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const isAgent = ['ADMIN', 'TEAM_LEAD', 'AGENT'].includes(user?.role ?? '');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', orgId, ticketId],
    queryFn: () => getTicket(orgId!, ticketId!),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', orgId, ticketId],
    queryFn: () => listComments(orgId!, ticketId!),
  });

  // Live updates
  React.useEffect(() => {
    if (!socket || !ticketId) return;
    socket.emit('ticket:join', ticketId);
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: ['ticket', orgId, ticketId] });
      void queryClient.invalidateQueries({ queryKey: ['comments', orgId, ticketId] });
    };
    socket.on('ticket.updated', handler);
    socket.on('comment.added', handler);
    return () => {
      socket.emit('ticket:leave', ticketId);
      socket.off('ticket.updated', handler);
      socket.off('comment.added', handler);
    };
  }, [socket, ticketId, orgId]);

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateTicketStatus(orgId!, ticketId!, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ticket', orgId, ticketId] });
      addToast({ type: 'success', message: 'Status updated' });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => createComment(orgId!, ticketId!, commentBody, isInternal),
    onSuccess: () => {
      setCommentBody('');
      void queryClient.invalidateQueries({ queryKey: ['comments', orgId, ticketId] });
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!ticket) return <p className="p-6 text-red-600">Ticket not found</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />Back to tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
              <StatusBadge status={ticket.status} />
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{ticket.description}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <PriorityBadge priority={ticket.priority} />
              <span className="text-xs text-gray-400">{ticket.channel.toLowerCase()}</span>
              <SlaTimer breachAt={ticket.slaBreachAt} />
            </div>
          </div>

          {/* Comment Thread */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Conversation ({comments.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <div key={comment.id} className={`p-6 ${comment.isInternal ? 'bg-yellow-50' : ''}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={comment.author.name} size="sm" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                      <span className="mx-2 text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    </div>
                    {comment.isInternal && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 rounded-full px-2 py-0.5">
                        <Lock className="h-3 w-3" />Internal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                </div>
              ))}
            </div>

            {/* Reply box */}
            <div className="p-6 border-t border-gray-100">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a reply..."
                rows={4}
                className="input mb-3"
              />
              <div className="flex items-center justify-between">
                {isAgent && (
                  <button
                    type="button"
                    onClick={() => setIsInternal((v) => !v)}
                    className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      isInternal
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {isInternal ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                    {isInternal ? 'Internal note' : 'Public reply'}
                  </button>
                )}
                <Button
                  className="ml-auto"
                  loading={commentMutation.isPending}
                  disabled={!commentBody.trim()}
                  onClick={() => commentMutation.mutate()}
                >
                  <Send className="h-4 w-4" />Reply
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {isAgent && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
              <Select
                options={STATUS_OPTIONS}
                value={ticket.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
              />
            </div>
          )}

          <div className="card p-4 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Requester</p>
              <div className="flex items-center gap-2">
                <Avatar name={ticket.requester.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.requester.name}</p>
                  <p className="text-xs text-gray-400">{ticket.requester.email}</p>
                </div>
              </div>
            </div>
            {ticket.assignee && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Assignee</p>
                <div className="flex items-center gap-2">
                  <Avatar name={ticket.assignee.name} size="sm" />
                  <p className="text-sm font-medium text-gray-900">{ticket.assignee.name}</p>
                </div>
              </div>
            )}
            {ticket.team && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Team</p>
                <p className="text-sm text-gray-900">{ticket.team.name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm text-gray-700">{format(new Date(ticket.createdAt), 'MMM d, yyyy HH:mm')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
