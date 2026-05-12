import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Sparkles, Plus, Trash2, Loader2, Printer, Mail } from 'lucide-react';
import { toast } from 'sonner';
import ResumePreview from './ResumePreview';

export default function ResumeEditor({ resume, participant, isGuest, onBack, onUpdate }) {
  const [data, setData] = useState(resume);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState('edit');

  const save = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...rest } = data;
    const updated = await base44.entities.Resume.update(resume.id, rest);
    onUpdate({ ...data, ...updated });
    toast.success('Saved!');
    setSaving(false);
  };

  const enhanceWithAI = async (field) => {
    setAiLoading(true);
    const prompt = field === 'summary'
      ? `Write a professional resume summary (2-3 sentences) for someone with this background: ${JSON.stringify({ skills: data.skills, experience: data.experience, education: data.education })}`
      : `Write a professional objective statement (1-2 sentences) for someone targeting roles related to: ${data.experience?.[0]?.title || 'their field'}`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setData({ ...data, [field]: result });
    setAiLoading(false);
    toast.success(`${field} enhanced with AI!`);
  };

  const addExperience = () => {
    setData({ ...data, experience: [...(data.experience || []), { company: '', title: '', start_date: '', end_date: '', current: false, bullets: [''] }] });
  };

  const addEducation = () => {
    setData({ ...data, education: [...(data.education || []), { institution: '', degree: '', field: '', start_year: '', end_year: '', achievements: '' }] });
  };

  const updateExperience = (idx, field, value) => {
    const exp = [...(data.experience || [])];
    exp[idx] = { ...exp[idx], [field]: value };
    setData({ ...data, experience: exp });
  };

  const updateEducation = (idx, field, value) => {
    const edu = [...(data.education || [])];
    edu[idx] = { ...edu[idx], [field]: value };
    setData({ ...data, education: edu });
  };

  const removeExperience = (idx) => setData({ ...data, experience: data.experience.filter((_, i) => i !== idx) });
  const removeEducation = (idx) => setData({ ...data, education: data.education.filter((_, i) => i !== idx) });

  const addBullet = (expIdx) => {
    const exp = [...data.experience];
    exp[expIdx].bullets = [...(exp[expIdx].bullets || []), ''];
    setData({ ...data, experience: exp });
  };

  const updateBullet = (expIdx, bulletIdx, value) => {
    const exp = [...data.experience];
    exp[expIdx].bullets[bulletIdx] = value;
    setData({ ...data, experience: exp });
  };

  const removeBullet = (expIdx, bulletIdx) => {
    const exp = [...data.experience];
    exp[expIdx].bullets = exp[expIdx].bullets.filter((_, i) => i !== bulletIdx);
    setData({ ...data, experience: exp });
  };

  const handlePrint = () => { setTab('preview'); setTimeout(() => window.print(), 300); };

  const handleEmail = async () => {
    if (!participant?.email) { toast.error('No email on file.'); return; }
    toast.info('Sending resume to your email...');
    const htmlContent = document.getElementById('resume-preview-content')?.innerHTML || 'Resume content unavailable';
    await base44.integrations.Core.SendEmail({
      to: participant.email,
      subject: `Your Resume: ${data.title}`,
      body: `<h2>${data.title}</h2>${htmlContent}`
    });
    toast.success('Resume sent to your email!');
  };

  const addSkill = (skill) => {
    if (skill && !data.skills?.includes(skill)) {
      setData({ ...data, skills: [...(data.skills || []), skill] });
    }
  };

  const removeSkill = (idx) => setData({ ...data, skills: data.skills.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-xl font-heading font-bold">{data.title}</h1>
            <Badge variant="outline" className="text-xs capitalize">{data.template}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> Print</Button>
          <Button variant="outline" size="sm" onClick={handleEmail}><Mail className="w-4 h-4 mr-1" /> Email</Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4 mt-4">
          {/* Summary & Objective */}
          <Card>
            <CardHeader><CardTitle className="text-base">Summary & Objective</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Professional Summary</Label>
                  <Button variant="ghost" size="sm" onClick={() => enhanceWithAI('summary')} disabled={aiLoading}>
                    <Sparkles className="w-3 h-3 mr-1" /> AI Suggest
                  </Button>
                </div>
                <Textarea value={data.summary || ''} onChange={e => setData({ ...data, summary: e.target.value })}
                  placeholder="A brief summary highlighting your key qualifications..." rows={3} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Objective</Label>
                  <Button variant="ghost" size="sm" onClick={() => enhanceWithAI('objective')} disabled={aiLoading}>
                    <Sparkles className="w-3 h-3 mr-1" /> AI Suggest
                  </Button>
                </div>
                <Textarea value={data.objective || ''} onChange={e => setData({ ...data, objective: e.target.value })}
                  placeholder="What type of role you're seeking..." rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Work Experience</CardTitle>
              <Button variant="outline" size="sm" onClick={addExperience}><Plus className="w-3 h-3 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {(data.experience || []).map((exp, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3 relative">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive h-7 w-7" onClick={() => removeExperience(idx)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Job Title</Label><Input value={exp.title || ''} onChange={e => updateExperience(idx, 'title', e.target.value)} /></div>
                    <div><Label className="text-xs">Company</Label><Input value={exp.company || ''} onChange={e => updateExperience(idx, 'company', e.target.value)} /></div>
                    <div><Label className="text-xs">Start Date</Label><Input value={exp.start_date || ''} onChange={e => updateExperience(idx, 'start_date', e.target.value)} placeholder="e.g. Jan 2022" /></div>
                    <div><Label className="text-xs">End Date</Label><Input value={exp.end_date || ''} onChange={e => updateExperience(idx, 'end_date', e.target.value)} placeholder="Present" /></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs">Key Achievements / Responsibilities</Label>
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => addBullet(idx)}><Plus className="w-3 h-3 mr-1" /> Bullet</Button>
                    </div>
                    {(exp.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground text-xs">•</span>
                        <Input value={bullet} onChange={e => updateBullet(idx, bIdx, e.target.value)} className="flex-1 text-sm" placeholder="Describe an achievement..." />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => removeBullet(idx, bIdx)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Education</CardTitle>
              <Button variant="outline" size="sm" onClick={addEducation}><Plus className="w-3 h-3 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(data.education || []).map((edu, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3 relative">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive h-7 w-7" onClick={() => removeEducation(idx)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Institution</Label><Input value={edu.institution || ''} onChange={e => updateEducation(idx, 'institution', e.target.value)} /></div>
                    <div><Label className="text-xs">Degree</Label><Input value={edu.degree || ''} onChange={e => updateEducation(idx, 'degree', e.target.value)} /></div>
                    <div><Label className="text-xs">Field of Study</Label><Input value={edu.field || ''} onChange={e => updateEducation(idx, 'field', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs">Start</Label><Input value={edu.start_year || ''} onChange={e => updateEducation(idx, 'start_year', e.target.value)} placeholder="2020" /></div>
                      <div><Label className="text-xs">End</Label><Input value={edu.end_year || ''} onChange={e => updateEducation(idx, 'end_year', e.target.value)} placeholder="2024" /></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader><CardTitle className="text-base">Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {(data.skills || []).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => removeSkill(idx)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
              <Input placeholder="Type a skill and press Enter"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(e.target.value.trim()); e.target.value = ''; } }} />
            </CardContent>
          </Card>

          {/* Template */}
          <Card>
            <CardHeader><CardTitle className="text-base">Template</CardTitle></CardHeader>
            <CardContent>
              <Select value={data.template || 'professional'} onValueChange={v => setData({ ...data, template: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <ResumePreview data={data} participant={participant} />
        </TabsContent>
      </Tabs>
    </div>
  );
}