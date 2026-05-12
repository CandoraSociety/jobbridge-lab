import React, { useState } from 'react';
import { useParticipant } from '@/lib/ParticipantContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Loader2, User, Briefcase, GraduationCap, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { participant, setParticipant, isGuest } = useParticipant();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    education: participant?.education || [],
    experience: participant?.experience || [],
    skills: participant?.skills || [],
    interests: participant?.interests || [],
    career_goals: participant?.career_goals || '',
  });

  const save = async () => {
    setSaving(true);
    await base44.entities.Participant.update(participant.id, data);
    const updated = { ...participant, ...data };
    setParticipant(updated);
    sessionStorage.setItem('joblab_participant', JSON.stringify(updated));
    toast.success('Profile saved!');
    setSaving(false);
  };

  // Education helpers
  const addEdu = () => setData({ ...data, education: [...data.education, { institution: '', degree: '', field: '', start_year: '', end_year: '' }] });
  const updateEdu = (i, f, v) => { const e = [...data.education]; e[i] = { ...e[i], [f]: v }; setData({ ...data, education: e }); };
  const removeEdu = (i) => setData({ ...data, education: data.education.filter((_, idx) => idx !== i) });

  // Experience helpers
  const addExp = () => setData({ ...data, experience: [...data.experience, { company: '', title: '', start_date: '', end_date: '', current: false, description: '' }] });
  const updateExp = (i, f, v) => { const e = [...data.experience]; e[i] = { ...e[i], [f]: v }; setData({ ...data, experience: e }); };
  const removeExp = (i) => setData({ ...data, experience: data.experience.filter((_, idx) => idx !== i) });

  // Skills helpers
  const addSkill = (s) => { if (s && !data.skills.includes(s)) setData({ ...data, skills: [...data.skills, s] }); };
  const removeSkill = (i) => setData({ ...data, skills: data.skills.filter((_, idx) => idx !== i) });

  // Interests helpers
  const addInterest = (s) => { if (s && !data.interests.includes(s)) setData({ ...data, interests: [...data.interests, s] }); };
  const removeInterest = (i) => setData({ ...data, interests: data.interests.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">Your education, experience, and skills power all the features in Job Lab</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Profile
        </Button>
      </div>

      {/* Contact Info (read only) */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Contact Information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><Label className="text-xs text-muted-foreground">Name</Label><p className="font-medium">{participant?.name}</p></div>
            <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium">{participant?.email}</p></div>
            <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="font-medium">{participant?.phone || '—'}</p></div>
          </div>
          {isGuest && <p className="text-xs text-accent mt-3">Guest account — create a full account to save your profile</p>}
        </CardContent>
      </Card>

      {/* Career Goals */}
      <Card>
        <CardHeader><CardTitle className="text-base">Career Goals</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={data.career_goals} onChange={e => setData({ ...data, career_goals: e.target.value })}
            placeholder="Describe your career goals, what type of work you're looking for, and where you'd like to be in 5 years..."
            rows={3} />
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" /> Work Experience</CardTitle>
          <Button variant="outline" size="sm" onClick={addExp}><Plus className="w-3 h-3 mr-1" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.experience.map((exp, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive h-7 w-7" onClick={() => removeExp(i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Job Title</Label><Input value={exp.title || ''} onChange={e => updateExp(i, 'title', e.target.value)} /></div>
                <div><Label className="text-xs">Company</Label><Input value={exp.company || ''} onChange={e => updateExp(i, 'company', e.target.value)} /></div>
                <div><Label className="text-xs">Start Date</Label><Input value={exp.start_date || ''} onChange={e => updateExp(i, 'start_date', e.target.value)} placeholder="Jan 2022" /></div>
                <div><Label className="text-xs">End Date</Label><Input value={exp.end_date || ''} onChange={e => updateExp(i, 'end_date', e.target.value)} placeholder="Present" /></div>
              </div>
              <div><Label className="text-xs">Description</Label><Textarea value={exp.description || ''} onChange={e => updateExp(i, 'description', e.target.value)} rows={2} /></div>
            </div>
          ))}
          {data.experience.length === 0 && <p className="text-sm text-muted-foreground">No experience added yet</p>}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Education</CardTitle>
          <Button variant="outline" size="sm" onClick={addEdu}><Plus className="w-3 h-3 mr-1" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.education.map((edu, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive h-7 w-7" onClick={() => removeEdu(i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Institution</Label><Input value={edu.institution || ''} onChange={e => updateEdu(i, 'institution', e.target.value)} /></div>
                <div><Label className="text-xs">Degree</Label><Input value={edu.degree || ''} onChange={e => updateEdu(i, 'degree', e.target.value)} /></div>
                <div><Label className="text-xs">Field of Study</Label><Input value={edu.field || ''} onChange={e => updateEdu(i, 'field', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Start</Label><Input value={edu.start_year || ''} onChange={e => updateEdu(i, 'start_year', e.target.value)} /></div>
                  <div><Label className="text-xs">End</Label><Input value={edu.end_year || ''} onChange={e => updateEdu(i, 'end_year', e.target.value)} /></div>
                </div>
              </div>
            </div>
          ))}
          {data.education.length === 0 && <p className="text-sm text-muted-foreground">No education added yet</p>}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="w-4 h-4" /> Skills</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.skills.map((s, i) => (
              <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => removeSkill(i)}>
                {s} ×
              </Badge>
            ))}
          </div>
          <Input placeholder="Type a skill and press Enter"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(e.target.value.trim()); e.target.value = ''; } }} />
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader><CardTitle className="text-base">Interests & Industries</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.interests.map((s, i) => (
              <Badge key={i} variant="outline" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => removeInterest(i)}>
                {s} ×
              </Badge>
            ))}
          </div>
          <Input placeholder="Type an interest/industry and press Enter"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInterest(e.target.value.trim()); e.target.value = ''; } }} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Profile
        </Button>
      </div>
    </div>
  );
}