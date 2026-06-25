import { useState, type FormEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { useAppSelector } from '@/store/hooks';
import { useCreateTicket } from './tickets.queries';
import type { TicketChannel, TicketPriority } from './tickets.types';

const priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const channels: TicketChannel[] = ['WEB', 'EMAIL', 'API'];

export function CreateTicketPage() {
  const navigate = useNavigate();
  const orgId = useAppSelector((state) => state.auth.user?.orgId);
  const createTicket = useCreateTicket(orgId);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [channel, setChannel] = useState<TicketChannel>('WEB');

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!orgId) return;

    const ticket = await createTicket.mutateAsync({
      subject,
      description,
      priority,
      channel,
    });

    navigate(`/orgs/${orgId}/tickets/${ticket.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(`/orgs/${orgId}/tickets`)}
        >
          Back to tickets
        </Button>

        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          New ticket
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Create a customer support request.
        </p>
      </div>

      <Card className="max-w-2xl">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            id="subject"
            label="Subject"
            placeholder="Short summary of the issue"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              className="min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Describe what happened and what the customer needs."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-slate-700"
              >
                Priority
              </label>
              <select
                id="priority"
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TicketPriority)
                }
              >
                {priorities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="channel"
                className="block text-sm font-medium text-slate-700"
              >
                Channel
              </label>
              <select
                id="channel"
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={channel}
                onChange={(event) =>
                  setChannel(event.target.value as TicketChannel)
                }
              >
                {channels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {createTicket.isError ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              Could not create ticket. Please check the form and try again.
            </div>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate(`/orgs/${orgId}/tickets`)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={createTicket.isPending}>
              {createTicket.isPending ? 'Creating...' : 'Create ticket'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}