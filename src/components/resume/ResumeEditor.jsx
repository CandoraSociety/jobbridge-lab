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
import { ArrowLeft, Save, Sparkles, Plus, Trash2, Loader2, Printer, Mail, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import ResumePreview from './ResumePreview';
import YearSelect from '@/components/profile/YearSelect';
import SkillInput from '@/components/profile/SkillInput';

export default function ResumeEditor({ resume, participant, isGuest, onBack, onUpdate }) {
  const [data, setData] = useState(resume);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState('edit');

  const save = async (andPreview = false) => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...rest } = data;
    const updated = await base44.entities.Resume.update(resume.id, rest);
    onUpdate({ ...data, ...updated });
    toast.success('Saved!');
    setSaving(false);
    if (andPreview) setTab('preview');
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

  const handleDownloadPDF = () => {
    setTab('preview');
    setTimeout(() => window.print(), 300);
  };

  const handleDownloadWord = () => {
    const el = document.getElementById('resume-preview-content');
    if (!el) { toast.error('Switch to Preview tab first'); return; }
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 1in; font-size: 11pt; color: #000; }
        h1 { font-size: 18pt; text-align: center; margin-bottom: 4pt; }
        .contact { text-align: center; font-size: 10pt; color: #444; margin-bottom: 12pt; }
        h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 2pt; margin-top: 14pt; margin-bottom: 6pt; }
        h3 { font-size: 11pt; margin: 0; }
        p, li { font-size: 10.5pt; margin: 2pt 0; line-height: 1.4; }
        .row { display: flex; justify-content: space-between; }
        .date { font-size: 10pt; color: #555; }
        ul { margin: 4pt 0 0 14pt; padding: 0; }
        .skills { font-size: 10.5pt; }
      </style></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title || 'Resume'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleEmail}><Mail className="w-4 h-4 mr-1" /> Email</Button>
          <Button variant="outline" size="sm" onClick={handleDownloadWord}><FileText className="w-4 h-4 mr-1" /> Word</Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}><Download className="w-4 h-4 mr-1" /> PDF</Button>
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
                    <div><Label className="text-xs">Start Year</Label><YearSelect value={exp.start_date} onChange={v => updateExperience(idx, 'start_date', v)} placeholder="Start year" /></div>
                    <div><Label className="text-xs">End Year</Label><YearSelect value={exp.end_date} onChange={v => updateExperience(idx, 'end_date', v)} placeholder="End / Present" /></div>
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
                    <div>
                      <Label className="text-xs">Degree / Credential</Label>
                      <Select value={edu.degree || ''} onValueChange={v => updateEducation(idx, 'degree', v)}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select degree..." /></SelectTrigger>
                        <SelectContent>
                          {["Some High School","High School Diploma / GED","Some College / CEGEP","College Diploma","College Certificate","Apprenticeship / Trades Certificate","Bachelor's Degree","Post-Graduate Diploma","Master's Degree","Doctoral Degree (PhD)","Professional Degree (MD, JD, etc.)","Other"].map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs">Field of Study</Label><Input value={edu.field || ''} onChange={e => updateEducation(idx, 'field', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs">Start</Label><YearSelect value={edu.start_year} onChange={v => updateEducation(idx, 'start_year', v)} placeholder="Start" /></div>
                      <div><Label className="text-xs">End</Label><YearSelect value={edu.end_year} onChange={v => updateEducation(idx, 'end_year', v)} placeholder="End" /></div>
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
              <SkillInput skills={data.skills || []} onAdd={addSkill} />
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

          {/* Bottom Save Buttons */}
          <div className="flex justify-end gap-3 pt-2 pb-6">
            <Button variant="outline" size="lg" onClick={() => save(false)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save
            </Button>
            <Button size="lg" onClick={() => save(true)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />} Save & Preview Resume
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <ResumePreview data={data} participant={participant} />
        </TabsContent>
      </Tabs>
    </div>
  );
}