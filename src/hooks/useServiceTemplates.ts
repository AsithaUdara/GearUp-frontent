// hooks/useServiceTemplates.ts
import { useCallback, useState } from 'react';
import { auth } from '@/lib/firebase';

// Default to the API Gateway on port 9090; can be overridden via NEXT_PUBLIC_API_BASE_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';
const ADMIN_TEMPLATES_ENDPOINT = `${API_BASE_URL}/api/v1/admin/service-templates`;

export interface ServiceTemplateDto {
  id?: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  active?: boolean;
}

export function useServiceTemplates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ServiceTemplateDto[]>([]);

  const getAuth = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    // We forward UID and ADMIN role header so downstream template-service can authorize ADMIN-only routes
    return { token, uid: user.uid };
  };

  const listTemplates = useCallback(async (activeOnly?: boolean) => {
    return listTemplatesByPage(0, 10, activeOnly);
  }, []);

  const listTemplatesByPage = useCallback(async (page = 0, size = 10, activeOnly?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const { token, uid } = await getAuth();
      const url = new URL(ADMIN_TEMPLATES_ENDPOINT);
      url.searchParams.set('page', String(page));
      url.searchParams.set('size', String(size));
      if (activeOnly) url.searchParams.set('activeOnly', 'true');
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Forwarded-Uid': uid,
          'X-User-Roles': 'ADMIN'
        }
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        let msg = json?.message || json?.error || `Failed to list templates (${res.status})`;
        if (res.status === 401 || res.status === 403) msg = 'Unauthorized: admin only.';
        throw new Error(msg);
      }
      const pageData = json.data as { items: ServiceTemplateDto[]; totalElements: number; totalPages: number; page: number; size: number };
      setItems(pageData.items || []);
      // expose pagination data via returned object
      return pageData;
    } finally { setLoading(false); }
  }, []);

  const createTemplate = useCallback(async (payload: ServiceTemplateDto) => {
    setLoading(true); setError(null);
    try {
      const { token, uid } = await getAuth();
      const res = await fetch(ADMIN_TEMPLATES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Forwarded-Uid': uid,
          'X-User-Roles': 'ADMIN'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        let msg = json?.message || json?.error || `Create failed (${res.status})`;
        if (res.status === 401 || res.status === 403) msg = 'Unauthorized: admin only.';
        throw new Error(msg);
      }
      const created = json.data as ServiceTemplateDto;
      setItems(prev => [...prev, created]);
      return created;
    } finally { setLoading(false); }
  }, []);

  const updateTemplate = useCallback(async (id: number, payload: ServiceTemplateDto) => {
    setLoading(true); setError(null);
    try {
      const { token, uid } = await getAuth();
      const res = await fetch(`${ADMIN_TEMPLATES_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Forwarded-Uid': uid,
          'X-User-Roles': 'ADMIN'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        let msg = json?.message || json?.error || `Update failed (${res.status})`;
        if (res.status === 401 || res.status === 403) msg = 'Unauthorized: admin only.';
        throw new Error(msg);
      }
      const updated = json.data as ServiceTemplateDto;
      setItems(prev => prev.map(t => (t.id === id ? updated : t)));
      return updated;
    } finally { setLoading(false); }
  }, []);

  const deleteTemplate = useCallback(async (id: number) => {
    setLoading(true); setError(null);
    try {
      const { token, uid } = await getAuth();
      const res = await fetch(`${ADMIN_TEMPLATES_ENDPOINT}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Forwarded-Uid': uid,
          'X-User-Roles': 'ADMIN'
        }
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        let msg = json?.message || json?.error || `Delete failed (${res.status})`;
        if (res.status === 401 || res.status === 403) msg = 'Unauthorized: admin only.';
        throw new Error(msg);
      }
      setItems(prev => prev.filter(t => t.id !== id));
      return true;
    } finally { setLoading(false); }
  }, []);

  return { items, loading, error, listTemplates, listTemplatesByPage, createTemplate, updateTemplate, deleteTemplate };
}
