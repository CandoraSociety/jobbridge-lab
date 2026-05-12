import React, { useState, useEffect } from 'react';
import { useParticipant } from '@/lib/ParticipantContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, MapPin, Building2, Briefcase, Loader2, Globe, Star, BookmarkPlus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const JOB_SITES = [
  { name: 'Indeed Canada', url: 'https://ca.indeed.com/jobs?q=', icon: '🔍' },
  { name: 'Job Bank Canada', url: 'https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=', icon: '🇨🇦' },
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/search/?keywords=', icon: '💼' },
  { name: 'Glassdoor', url: 'https://www.glassdoor.ca/Job/jobs.htm?sc.keyword=', icon: '🏢' },
  { name: 'ALIS Alberta', url: 'https://alis.alberta.ca/look-for-work/', icon: '🌾' },
];

export default function JobSearch() {
  const { participant } = useParticipant();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Alberta');
  const [jobResults, setJobResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());

  const saveToTracker = async (job) => {
    await base44.entities.JobApplication.create({
      participant_id: participant.id,
      company: job.company,
      position: job.title,
      location: job.location,
      salary_range: job.salary,
      job_description: job.description,
      status: 'saved',
    });
    setSavedJobs(prev => new Set([...prev, job.title + job.company]));
    toast.success(`"${job.title}" saved to your Job Tracker!`);
  };

  // Suggest search based on participant skills
  useEffect(() => {
    if (participant?.skills?.length > 0 && !searchQuery) {
      setSearchQuery(participant.skills.slice(0, 2).join(', '));
    } else if (participant?.experience?.length > 0 && !searchQuery) {
      const latest = participant.experience[0];
      if (latest?.title) setSearchQuery(latest.title);
    }
  }, [participant]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term.');
      return;
    }
    setLoading(true);
    setHasSearched(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 8 realistic job listings for the search query "${searchQuery}" in "${location}". 
      ${participant?.skills?.length ? `The person has these skills: ${participant.skills.join(', ')}` : ''}
      ${participant?.experience?.length ? `Their latest experience: ${participant.experience[0]?.title} at ${participant.experience[0]?.company}` : ''}
      
      Generate realistic job postings that would appear on Canadian job boards. Include variety in companies and seniority levels.`,
      response_json_schema: {
        type: "object",
        properties: {
          jobs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                company: { type: "string" },
                location: { type: "string" },
                salary: { type: "string" },
                type: { type: "string" },
                description: { type: "string" },
                posted: { type: "string" },
                match_score: { type: "number" }
              }
            }
          }
        }
      }
    });

    setJobResults(result.jobs || []);
    setLoading(false);
  };

  const openJobSite = (site) => {
    const query = encodeURIComponent(searchQuery || 'jobs');
    window.open(site.url + query, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Job Search</h1>
        <p className="text-muted-foreground mt-1">Find opportunities tailored to your experience and skills</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Job title, skills, or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1 sm:flex-none">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 sm:w-48"
                  placeholder="Location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">AI Results</TabsTrigger>
          <TabsTrigger value="sites">Job Sites</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Searching for jobs...</p>
              </div>
            </div>
          ) : hasSearched && jobResults.length > 0 ? (
            <div className="grid gap-3">
              <AnimatePresence>
                {jobResults.map((job, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="hover:shadow-md transition-all hover:border-primary/20">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                              {job.type && <Badge variant="secondary" className="text-xs">{job.type}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {job.salary && <Badge variant="outline" className="text-xs">{job.salary}</Badge>}
                              {job.posted && <Badge variant="outline" className="text-xs">{job.posted}</Badge>}
                              {job.match_score >= 80 && <Badge className="text-xs bg-chart-2/10 text-chart-2 border-0"><Star className="w-3 h-3 mr-1" />Great match</Badge>}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {savedJobs.has(job.title + job.company) ? (
                              <Button variant="outline" size="sm" disabled className="text-chart-2">
                                <Check className="w-3 h-3 mr-1" /> Saved
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => saveToTracker(job)}>
                                <BookmarkPlus className="w-3 h-3 mr-1" /> Save to Tracker
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              <p className="text-xs text-muted-foreground text-center mt-4">These results are AI-generated suggestions. Use the Job Sites tab to search real job postings.</p>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No results found. Try different keywords.</p>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Enter a search term to find matching jobs</p>
              {participant?.skills?.length > 0 && (
                <p className="text-xs mt-2">We've pre-filled based on your profile skills</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sites" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {JOB_SITES.map(site => (
              <Card key={site.name} className="hover:shadow-md transition-all cursor-pointer hover:border-primary/20"
                onClick={() => openJobSite(site)}>
                <CardContent className="p-5 flex items-center gap-4">
                  <span className="text-2xl">{site.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{site.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Click to search</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            {searchQuery ? `Will search for "${searchQuery}"` : 'Enter a search term above first'}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}