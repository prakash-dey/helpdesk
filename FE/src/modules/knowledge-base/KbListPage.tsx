import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, BookOpen } from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  author: { name: string };
  category?: { name: string };
}

export default function KbListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const isAgent = ['ADMIN', 'TEAM_LEAD', 'AGENT'].includes(user?.role ?? '');

  const { data, isLoading } = useQuery({
    queryKey: ['kb-articles', orgId, search],
    queryFn: async () => {
      if (search.length >= 2) {
        const { data } = await api.get<{ data: Article[] }>(`/orgs/${orgId}/kb/articles/search`, { params: { q: search } });
        return data.data;
      }
      const { data } = await api.get<{ data: Article[] }>(`/orgs/${orgId}/kb/articles`, {
        params: isAgent ? {} : { status: 'PUBLISHED' },
      });
      return data.data;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        {isAgent && (
          <Link to={`/orgs/${orgId}/kb/articles/new`}>
            <Button><Plus className="h-4 w-4" />New Article</Button>
          </Link>
        )}
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="input pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((article) => (
            <Link key={article.id} to={`/orgs/${orgId}/kb/articles/${article.id}`} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                {isAgent && (
                  <Badge variant={article.status === 'PUBLISHED' ? 'success' : article.status === 'DRAFT' ? 'default' : 'warning'}>
                    {article.status.toLowerCase()}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">{article.title}</h3>
              {article.category && (
                <p className="text-xs text-gray-400 mb-2">{article.category.name}</p>
              )}
              <p className="text-xs text-gray-400">
                by {article.author.name} · {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
              </p>
            </Link>
          ))}
          {!data?.length && (
            <div className="col-span-3 text-center py-12 text-gray-400">No articles found</div>
          )}
        </div>
      )}
    </div>
  );
}
