import React, { useState } from 'react';
import { useParticipant } from '@/lib/ParticipantContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2, MapPin, Calendar, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  saved: { label: 'Saved', class: 'bg-muted text-muted-foreground' },
  applied: { label: 'Applied', class: 'bg-primary/10 text-primary' },
  phone_screen: { label: 'Phone Screen', class: 'bg-chart-4/10 text-chart-4' },
  interview: { label: 'Interview', class: 'bg-accent/10 text-accent' },
  offer: { label: 'Offer', class: 'bg-chart-2/10 text-chart-2' },
  rejected: { label: 'Rejected', class: 'bg-destructive/10 text-destructive' },
  withdrawn: { label: 'Withdrawn', class: 'bg-muted text-muted-foreground' },
};

const emptyForm = { company: '', position: '', location: '', job_url: '', status: 'saved', date_applied: '', salary_range: '', notes: '', follow_up_date: '' };

export default function JobTracker() {
  const { participant } = useParticipant();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['jobApplications', participant?.id],
    queryFn: () => base44.entities.JobApplication.filter({ participant_id: participant?.id }),
    enabled: !!participant?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JobApplication.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobApplications'] }); setDialogOpen(false); setForm(emptyForm); toast.success('Application added!'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobApplication.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobApplications'] }); setDialogOpen(false); setEditingId(null); setForm(emptyForm); toast.success('Application updated!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.JobApplication.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobApplications'] }); toast.success('Application removed.'); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, participant_id: participant.id };
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (app) => {
    setForm({ company: app.company, position: app.position, location: app.location || '', job_url: app.job_url || '', status: app.status || 'saved', date_applied: app.date_applied || '', salary_range: app.salary_range || '', notes: app.notes || '', follow_up_date: app.follow_up_date || '' });
    setEditingId(app.id);
    setDialogOpen(true);
  };

  const filtered = filterStatus === 'all' ? applications : applications.filter(a => a.status === filterStatus);

  const statusCounts = applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Job Application Tracker</h1>
          <p className="text-muted-foreground mt-1">Keep track of every application you send out</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Application</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'Edit Application' : 'New Application'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Company *</Label><Input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
                <div><Label>Position *</Label><Input required value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date Applied</Label><Input type="date" value={form.date_applied} onChange={e => setForm({ ...form, date_applied: e.target.value })} /></div>
                <div><Label>Salary Range</Label><Input value={form.salary_range} onChange={e => setForm({ ...form, salary_range: e.target.value })} placeholder="e.g. $50,000 - $65,000" /></div>
              </div>
              <div><Label>Job URL</Label><Input value={form.job_url} onChange={e => setForm({ ...form, job_url: e.target.value })} placeholder="https://..." /></div>
              <div><Label>Follow-up Date</Label><Input type="date" value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
              <Button type="submit" className="w-full">{editingId ? 'Update' : 'Add Application'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <Button variant={filterStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>
          All ({applications.length})
        </Button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          statusCounts[key] ? (
            <Button key={key} variant={filterStatus === key ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(key)}>
              {cfg.label} ({statusCounts[key]})
            </Button>
          ) : null
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-3">
          <AnimatePresence>
            {filtered.map(app => (
              <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="hover:shadow-md transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{app.position}</h3>
                          <Badge className={`text-xs border-0 ${STATUS_CONFIG[app.status]?.class || ''}`}>
                            {STATUS_CONFIG[app.status]?.label || app.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{app.company}</span>
                          {app.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.location}</span>}
                          {app.date_applied && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(app.date_applied), 'MMM d, yyyy')}</span>}
                        </div>
                        {app.salary_range && <p className="text-xs text-muted-foreground mt-1">{app.salary_range}</p>}
                        {app.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{app.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {app.job_url && (
                          <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                          </a>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(app)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(app.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Plus className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No applications yet. Start tracking your job search!</p>
        </div>
      )}
    </div>
  );
}