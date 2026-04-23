import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/axios';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

interface Article { id: string; title: string; body: string; status: string; author: { name: string }; updatedAt: string; category?: { name: string } }

export default function KbArticlePage() {
  const { orgId, articleId } = useParams<{ orgId: string; articleId: string }>();
  const user = useAuthStore((s) => s.user);
  const isAgent = ['ADMIN', 'TEAM_LEAD', 'AGENT'].includes(user?.role ?? '');

  const { data: article, isLoading } = useQuery({
    queryKey: ['kb-article', orgId, articleId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Article }>(`/orgs/${orgId}/kb/articles/${articleId}`);
      return data.data;
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!article) return <p className="p-6 text-red-600">Article not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to={`/orgs/${orgId}/kb`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />Knowledge Base
        </Link>
        {isAgent && (
          <Link to={`/orgs/${orgId}/kb/articles/${article.id}/edit`}>
            <Button variant="secondary" size="sm"><Edit className="h-4 w-4" />Edit</Button>
          </Link>
        )}
      </div>

      <article className="card p-8">
        {article.category && (
          <p className="text-xs text-primary-600 font-medium uppercase tracking-wider mb-3">{article.category.name}</p>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
          <span>By {article.author.name}</span>
          <span>·</span>
          <span>Updated {format(new Date(article.updatedAt), 'MMM d, yyyy')}</span>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{article.body}</div>
      </article>
    </div>
  );
}
