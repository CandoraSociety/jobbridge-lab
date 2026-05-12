import React, { useState, useEffect } from 'react';
import { useParticipant } from '@/lib/ParticipantContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Trash2, Pencil, Save, Sparkles, Loader2, Printer, Mail } from 'lucide-react';
import { toast } from 'sonner';
import ResumePreview from '@/components/resume/ResumePreview';
import ResumeEditor from '@/components/resume/ResumeEditor';

export default function ResumeBuilder() {
  const { participant, isGuest } = useParticipant();
  const queryClient = useQueryClient();
  const [selectedResume, setSelectedResume] = useState(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState('professional');

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['resumes', participant?.id],
    queryFn: () => base44.entities.Resume.filter({ participant_id: participant?.id }),
    enabled: !!participant?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Resume.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setSelectedResume(data);
      setShowNewDialog(false);
      setNewTitle('');
      toast.success('Resume created!');
    },
  });

  const normalizeResume = (resumeData) => ({
    ...resumeData,
    experience: (resumeData.experience || []).map(exp => ({
      ...exp,
      bullets: exp.bullets?.length ? exp.bullets : exp.description ? [exp.description] : [''],
    })),
    education: resumeData.education || [],
    skills: resumeData.skills || [],
  });

  const handleCreateResume = () => {
    if (!newTitle.trim()) { toast.error('Please enter a resume name.'); return; }
    createMutation.mutate(normalizeResume({
      participant_id: participant.id,
      title: newTitle,
      template: newTemplate,
      education: participant?.education || [],
      experience: participant?.experience || [],
      skills: participant?.skills || [],
      summary: '',
      objective: '',
      certifications: [],
      volunteer: [],
      references_available: true,
    }));
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Resume.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      if (selectedResume) setSelectedResume(null);
      toast.success('Resume deleted.');
    },
  });

  if (selectedResume) {
    return (
      <ResumeEditor
        resume={selectedResume}
        participant={participant}
        isGuest={isGuest}
        onBack={() => setSelectedResume(null)}
        onUpdate={(updated) => {
          setSelectedResume(updated);
          queryClient.invalidateQueries({ queryKey: ['resumes'] });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">Create professional resumes with guided prompts and templates</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Resume</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Resume</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Resume Name</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Marketing Manager Resume" /></div>
              <div>
                <Label>Template Style</Label>
                <Select value={newTemplate} onValueChange={setNewTemplate}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="simple">Simple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {participant?.education?.length > 0 && (
                <p className="text-xs text-muted-foreground">Your profile info will be imported automatically.</p>
              )}
              <Button onClick={handleCreateResume} className="w-full">Create Resume</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isGuest && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-3 text-sm">
            <Mail className="w-5 h-5 text-accent shrink-0" />
            <p>As a guest, your resume won't be saved after you log out. Use the email or print features to save your work.</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
      ) : resumes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map(resume => (
            <Card key={resume.id} className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/20"
              onClick={() => setSelectedResume(normalizeResume(resume))}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(resume.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{resume.title}</h3>
                <Badge variant="outline" className="mt-2 text-xs capitalize">{resume.template}</Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {(resume.experience?.length || 0)} positions · {(resume.education?.length || 0)} education · {(resume.skills?.length || 0)} skills
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No resumes yet</p>
          <p className="text-sm mt-1">Create your first resume to get started</p>
        </div>
      )}
    </div>
  );
}