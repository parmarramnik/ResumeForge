'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Code,
  Calendar,
  Layers,
  User,
  Shield,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AuditLog } from '@resumeforge/shared-types';
import { formatDate } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLogs(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.resource_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Security Audit Logs</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable audit record of administrative actions, template publishing, and security events.
          </p>
        </div>

        {/* Search */}
        <div className="bg-card p-3 rounded-lg border border-border flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit actions or resource..."
              className="pl-9 h-8 text-xs bg-muted/30"
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {filteredLogs.length} events recorded
          </span>
        </div>

        {/* Logs Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={selectedLog ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <Card className="overflow-hidden border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                    <tr>
                      <th className="p-3.5 pl-5">Action</th>
                      <th className="p-3.5">Resource</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5 pr-5 text-right">Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`hover:bg-muted/30 cursor-pointer transition-colors ${
                          selectedLog?.id === log.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="p-3.5 pl-5 font-mono font-semibold text-foreground">
                          {log.action}
                        </td>
                        <td className="p-3.5 font-mono text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">
                            {log.resource_type}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-muted-foreground font-mono">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs font-mono">
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Selected Log Inspector */}
          {selectedLog && (
            <div className="lg:col-span-5">
              <Card className="p-5 space-y-4 border-border bg-card sticky top-20">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-semibold text-sm">Event Payload Inspector</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-xs"
                    onClick={() => setSelectedLog(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Log ID:</span>
                    <span className="text-foreground">{selectedLog.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Action:</span>
                    <span className="text-foreground font-bold">{selectedLog.action}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Resource Type:</span>
                    <span className="text-foreground">{selectedLog.resource_type}</span>
                  </div>
                  {selectedLog.resource_id && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Resource ID:</span>
                      <span className="text-foreground truncate max-w-[200px]">{selectedLog.resource_id}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Metadata JSON
                  </span>
                  <pre className="p-3 rounded-lg bg-muted/50 border border-border font-mono text-[11px] overflow-x-auto text-foreground">
                    {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                  </pre>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
