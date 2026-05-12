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
import { Plus, Route, Sparkles, Loader2, Trash2, Target, Check, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const STATUS_ICONS = {
  not_started: <Circle className="w-4 h-4 text-muted-foreground" />,
  in_progress: <Target className="w-4 h-4 text-primary" />,
  completed: <Check className="w-4 h-4 text-chart-2" />,
};

export default function CareerPath() {
  const { participant } = useParticipant();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', current_role: '', target_role: '', timeline_years: 3 });
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

  const { data: paths = [], isLoading } = useQuery({
    queryKey: ['careerPaths', participant?.id],
    queryFn: () => base44.entities.CareerPath.filter({ participant_id: participant?.id }),
    enabled: !!participant?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CareerPath.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['careerPaths'] });
      setShowNew(false);
      setSelectedPath(data);
      toast.success('Career path created!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CareerPath.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['careerPaths'] });
      setSelectedPath(prev => ({ ...prev, ...data }));
      toast.success('Updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CareerPath.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerPaths'] });
      setSelectedPath(null);
      toast.success('Path deleted.');
    },
  });

  const generateAIPath = async () => {
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a detailed career path from "${newForm.current_role || 'entry-level'}" to "${newForm.target_role}" over ${newForm.timeline_years} years.
      ${participant?.skills?.length ? `Current skills: ${participant.skills.join(', ')}` : ''}
      ${participant?.education?.length ? `Education: ${participant.education.map(e => e.degree + ' ' + e.field).join(', ')}` : ''}
      Generate 4-6 milestones with specific skills needed for each.`,
      response_json_schema: {
        type: "object",
        properties: {
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                target_date: { type: "string" },
                skills_needed: { type: "array", items: { type: "string" } }
              }
            }
          },
          required_skills: { type: "array", items: { type: "string" } },
          required_education: { type: "string" }
        }
      }
    });

    createMutation.mutate({
      participant_id: participant.id,
      title: newForm.title || `${newForm.current_role} → ${newForm.target_role}`,
      current_role: newForm.current_role,
      target_role: newForm.target_role,
      timeline_years: newForm.timeline_years,
      milestones: (result.milestones || []).map(m => ({ ...m, status: 'not_started' })),
      required_skills: result.required_skills || [],
      required_education: result.required_education || '',
    });
    setAiLoading(false);
  };

  const toggleMilestoneStatus = (path, mIdx) => {
    const milestones = [...(path.milestones || [])];
    const statuses = ['not_started', 'in_progress', 'completed'];
    const current = statuses.indexOf(milestones[mIdx].status);
    milestones[mIdx].status = statuses[(current + 1) % 3];
    updateMutation.mutate({ id: path.id, data: { milestones } });
  };

  if (selectedPath) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedPath(null)}>← Back</Button>
            <h1 className="text-xl font-heading font-bold">{selectedPath.title}</h1>
          </div>
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(selectedPath.id)}>
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Current Role</p><p className="font-semibold mt-1">{selectedPath.current_role || 'Not set'}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Target Role</p><p className="font-semibold mt-1">{selectedPath.target_role || 'Not set'}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Timeline</p><p className="font-semibold mt-1">{selectedPath.timeline_years || '—'} years</p></CardContent></Card>
        </div>

        {selectedPath.required_skills?.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Required Skills</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {selectedPath.required_skills.map((s, i) => <Badge key={i} variant="outline">{s}</Badge>)}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Milestones</CardTitle></CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {(selectedPath.milestones || []).map((m, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    className="relative pl-10">
                    <button onClick={() => toggleMilestoneStatus(selectedPath, idx)}
                      className="absolute left-2 top-1 z-10 bg-background rounded-full p-0.5 border hover:scale-110 transition-transform">
                      {STATUS_ICONS[m.status]}
                    </button>
                    <div className={`p-4 rounded-lg border ${m.status === 'completed' ? 'bg-chart-2/5 border-chart-2/20' : m.status === 'in_progress' ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
                      <h3 className="font-semibold text-sm">{m.title}</h3>
                      {m.target_date && <p className="text-xs text-muted-foreground mt-0.5">{m.target_date}</p>}
                      <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                      {m.skills_needed?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.skills_needed.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Career Path Builder</h1>
          <p className="text-muted-foreground mt-1">Map out your career trajectory with AI-powered guidance</p>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Path</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Career Path</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Path Name</Label><Input value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} placeholder="e.g. Software Developer Track" /></div>
              <div><Label>Current Role</Label><Input value={newForm.current_role} onChange={e => setNewForm({ ...newForm, current_role: e.target.value })} placeholder="e.g. Junior Developer" /></div>
              <div><Label>Target Role</Label><Input value={newForm.target_role} onChange={e => setNewForm({ ...newForm, target_role: e.target.value })} placeholder="e.g. Senior Software Engineer" /></div>
              <div>
                <Label>Timeline (years)</Label>
                <Select value={String(newForm.timeline_years)} onValueChange={v => setNewForm({ ...newForm, timeline_years: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 7, 10].map(y => <SelectItem key={y} value={String(y)}>{y} year{y > 1 ? 's' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generateAIPath} className="w-full" disabled={aiLoading || !newForm.target_role}>
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate AI Career Path
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
      ) : paths.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paths.map(path => (
            <Card key={path.id} className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/20"
              onClick={() => setSelectedPath(path)}>
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Route className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">{path.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {path.current_role || 'Start'} → {path.target_role || 'Goal'}
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">{path.timeline_years}y timeline</Badge>
                  <Badge variant="outline" className="text-xs">{path.milestones?.length || 0} milestones</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Route className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No career paths yet</p>
          <p className="text-sm mt-1">Create a path to map your career trajectory</p>
        </div>
      )}
    </div>
  );
}