import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Star, Headphones } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface Survey {
  id: string;
  score: number | null;
  submittedAt: string | null;
  ticket: { id: string; subject: string };
}

export default function CsatSurveyPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: survey, isLoading } = useQuery({
    queryKey: ['csat', surveyId],
    queryFn: async () => {
      const { data } = await axios.get<{ data: Survey }>(`/api/v1/csat/${surveyId}`);
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: () => axios.post(`/api/v1/csat/${surveyId}/submit`, { score, comment }),
    onSuccess: () => setSubmitted(true),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!survey) return <p className="text-center py-20 text-red-600">Survey not found</p>;
  if (survey.submittedAt || submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <Star className="h-8 w-8 text-green-500 fill-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-gray-500">Your feedback has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">SupportDesk Pro</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">How did we do?</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your ticket <strong>"{survey.ticket.subject}"</strong> has been resolved.
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setScore(s)}
              className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all ${
                score === s
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-gray-400 hover:border-primary-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400 mb-4">1 = Very unsatisfied · 5 = Very satisfied</p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any additional comments? (optional)"
          rows={3}
          className="input mb-4"
        />

        <Button
          className="w-full"
          disabled={!score}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Submit Feedback
        </Button>
      </div>
    </div>
  );
}
