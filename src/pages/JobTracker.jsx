import React, { useState } from 'react';
import { useParticipant } from '@/lib/ParticipantContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, MapPin, Calendar, ExternalLink, Pencil, Trash2, BookmarkCheck, ClipboardList, AlertCircle } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
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

const emptyForm = {
  company: '', position: '', location: '', job_url: '', status: 'saved',
  date_applied: '', salary_range: '', notes: '', follow_up_date: '',
  deadline: '', how_to_apply: '', application_instructions: '', job_description: ''
};

export default function JobTracker() {
  const { participant } = useParticipant();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['jobApplications', participant?.id],
    queryFn: () => base44.entities.JobApplication.filter({ participant_id: participant?.id }),
    enabled: !!participant?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JobApplication.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobApplications'] }); setDialogOpen(false); setForm(emptyForm); toast.success('Added to tracker!'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobApplication.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobApplications'] }); setDialogOpen(false); setEditingId(null); setForm(emptyForm); toast.success('Updated!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.JobApplication.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobApplications'] }); toast.success('Removed.'); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, participant_id: participant.id };
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (app) => {
    setForm({
      company: app.company, position: app.position, location: app.location || '',
      job_url: app.job_url || '', status: app.status || 'saved', date_applied: app.date_applied || '',
      salary_range: app.salary_range || '', notes: app.notes || '', follow_up_date: app.follow_up_date || '',
      deadline: app.deadline || '', how_to_apply: app.how_to_apply || '',
      application_instructions: app.application_instructions || '', job_description: app.job_description || ''
    });
    setEditingId(app.id);
    setDialogOpen(true);
  };

  const markApplied = (app) => {
    updateMutation.mutate({ id: app.id, data: { ...app, status: 'applied', date_applied: new Date().toISOString().split('T')[0] } });
  };

  const savedListings = applications.filter(a => a.status === 'saved');
  const activeApplications = applications.filter(a => a.status !== 'saved');
  const filtered = filterStatus === 'all' ? activeApplications : activeApplications.filter(a => a.status === filterStatus);
  const statusCounts = activeApplications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  const ApplicationForm = () => (
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
        <div><Label>Application Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
        <div><Label>Salary Range</Label><Input value={form.salary_range} onChange={e => setForm({ ...form, salary_range: e.target.value })} placeholder="e.g. $50,000–$65,000" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Date Applied</Label><Input type="date" value={form.date_applied} onChange={e => setForm({ ...form, date_applied: e.target.value })} /></div>
        <div><Label>Follow-up Date</Label><Input type="date" value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} /></div>
      </div>
      <div><Label>Job URL</Label><Input value={form.job_url} onChange={e => setForm({ ...form, job_url: e.target.value })} placeholder="https://..." /></div>
      <div>
        <Label>How to Apply</Label>
        <Select value={form.how_to_apply} onValueChange={v => setForm({ ...form, how_to_apply: v })}>
          <SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online (website/portal)</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="in_person">In Person</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="indeed">Indeed</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Application Instructions</Label><Textarea value={form.application_instructions} onChange={e => setForm({ ...form, application_instructions: e.target.value })} placeholder="e.g. Include cover letter, reference number ABC-123, two references..." rows={2} /></div>
      <div><Label>Job Description</Label><Textarea value={form.job_description} onChange={e => setForm({ ...form, job_description: e.target.value })} placeholder="Paste or summarize the job description..." rows={3} /></div>
      <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
      <Button type="submit" className="w-full">{editingId ? 'Update' : 'Add to Tracker'}</Button>
    </form>
  );

  const AppCard = ({ app, showApplyButton = false }) => {
    const isExpanded = expandedId === app.id;
    const deadlinePast = app.deadline && isPast(parseISO(app.deadline));
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{app.position}</h3>
                  {app.status !== 'saved' && (
                    <Badge className={`text-xs border-0 ${STATUS_CONFIG[app.status]?.class || ''}`}>
                      {STATUS_CONFIG[app.status]?.label || app.status}
                    </Badge>
                  )}
                  {app.deadline && (
                    <Badge variant="outline" className={`text-xs flex items-center gap-1 ${deadlinePast ? 'border-destructive text-destructive' : 'border-accent text-accent'}`}>
                      {deadlinePast && <AlertCircle className="w-3 h-3" />}
                      Deadline: {format(parseISO(app.deadline), 'MMM d, yyyy')}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{app.company}</span>
                  {app.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.location}</span>}
                  {app.date_applied && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied: {format(parseISO(app.date_applied), 'MMM d')}</span>}
                  {app.salary_range && <span>{app.salary_range}</span>}
                </div>
                {app.how_to_apply && (
                  <p className="text-xs text-muted-foreground mt-1">How to apply: <span className="capitalize">{app.how_to_apply.replace('_', ' ')}</span></p>
                )}
                {isExpanded && (
                  <div className="mt-3 space-y-2">
                    {app.application_instructions && (
                      <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-accent mb-1">Application Instructions</p>
                        <p className="text-sm">{app.application_instructions}</p>
                      </div>
                    )}
                    {app.job_description && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Job Description</p>
                        <p className="text-sm whitespace-pre-wrap line-clamp-6">{app.job_description}</p>
                      </div>
                    )}
                    {app.notes && <p className="text-sm text-muted-foreground">{app.notes}</p>}
                    {app.follow_up_date && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />Follow up: {format(parseISO(app.follow_up_date), 'MMM d, yyyy')}</p>}
                  </div>
                )}
                {(app.application_instructions || app.job_description || app.notes) && (
                  <button onClick={() => setExpandedId(isExpanded ? null : app.id)} className="text-xs text-primary mt-2 hover:underline">
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {app.job_url && (
                  <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                  </a>
                )}
                {showApplyButton && (
                  <Button size="sm" onClick={() => markApplied(app)}>
                    <ClipboardList className="w-3 h-3 mr-1" /> Mark Applied
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleEdit(app)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(app.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Job Tracker</h1>
          <p className="text-muted-foreground mt-1">Track job listings and manage your applications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({ ...emptyForm, status: activeTab === 'applications' ? 'applied' : 'saved' })}>
              <Plus className="w-4 h-4 mr-2" /> Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'Edit Job' : 'Add Job'}</DialogTitle></DialogHeader>
            <ApplicationForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="listings" className="flex items-center gap-1.5">
            <BookmarkCheck className="w-4 h-4" /> Saved Listings
            {savedListings.length > 0 && <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">{savedListings.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4" /> Applications
            {activeApplications.length > 0 && <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">{activeApplications.length}</span>}
          </TabsTrigger>
        </TabsList>

        {/* Saved Listings Tab */}
        <TabsContent value="listings" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">Jobs you're interested in but haven't applied to yet. Save jobs from the <strong>Job Search</strong> page or add them manually.</p>
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : savedListings.length > 0 ? (
            <div className="grid gap-3">
              <AnimatePresence>
                {savedListings.map(app => <AppCard key={app.id} app={app} showApplyButton={true} />)}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BookmarkCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No saved listings yet.</p>
              <p className="text-sm mt-1">Use the Job Search page to find jobs and save them here, or click <strong>Add Job</strong> above.</p>
            </div>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant={filterStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>
              All ({activeApplications.length})
            </Button>
            {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'saved').map(([key, cfg]) => (
              statusCounts[key] ? (
                <Button key={key} variant={filterStatus === key ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(key)}>
                  {cfg.label} ({statusCounts[key]})
                </Button>
              ) : null
            ))}
          </div>
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-3">
              <AnimatePresence>
                {filtered.map(app => <AppCard key={app.id} app={app} />)}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No applications yet.</p>
              <p className="text-sm mt-1">Mark a saved listing as applied, or add an application directly.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}