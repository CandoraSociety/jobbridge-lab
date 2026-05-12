import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink, BookOpen, GraduationCap, Users, FileText,
  Video, Globe, Briefcase, MessageSquare, Target
} from 'lucide-react';
import { motion } from 'framer-motion';

const resources = {
  job_search: [
    { title: 'ALIS Alberta - Look for Work', url: 'https://alis.alberta.ca/look-for-work/', desc: 'Comprehensive job search resources for Albertans', icon: Globe },
    { title: 'Job Bank Canada', url: 'https://www.jobbank.gc.ca', desc: 'Government of Canada job listings and labour market info', icon: Briefcase },
    { title: 'WorkBC Career Guide', url: 'https://www.workbc.ca/plan-career', desc: 'Plan your career with skills assessments and tools', icon: Target },
    { title: 'Canada Job Search Tips', url: 'https://www.canada.ca/en/services/jobs/opportunities.html', desc: 'Federal government job search resources', icon: FileText },
  ],
  interview: [
    { title: 'Common Interview Questions', url: 'https://alis.alberta.ca/look-for-work/find-and-apply-for-jobs/prepare-for-an-interview/', desc: 'ALIS guide to interview preparation', icon: MessageSquare },
    { title: 'STAR Method Guide', url: 'https://www.jobbank.gc.ca/findajob/resources/prepare-for-an-interview', desc: 'Structure answers using Situation, Task, Action, Result', icon: Target },
    { title: 'Virtual Interview Tips', url: 'https://www.jobbank.gc.ca/findajob/resources/virtual-job-interviews', desc: 'How to succeed in virtual/video interviews', icon: Video },
  ],
  resume_writing: [
    { title: 'ALIS Resume Writing', url: 'https://alis.alberta.ca/look-for-work/find-and-apply-for-jobs/resumes/', desc: 'Tips and templates for effective resumes', icon: FileText },
    { title: 'Cover Letter Guide', url: 'https://alis.alberta.ca/look-for-work/find-and-apply-for-jobs/cover-letters/', desc: 'Write compelling cover letters', icon: FileText },
    { title: 'LinkedIn Profile Tips', url: 'https://www.jobbank.gc.ca/findajob/resources/social-media-job-search', desc: 'Optimize your online professional presence', icon: Users },
  ],
  training: [
    { title: 'LinkedIn Learning', url: 'https://www.linkedin.com/learning/', desc: 'Professional development courses', icon: GraduationCap, tag: 'Paid' },
    { title: 'Coursera', url: 'https://www.coursera.org', desc: 'Free and paid courses from top universities', icon: GraduationCap, tag: 'Free/Paid' },
    { title: 'Google Career Certificates', url: 'https://grow.google/intl/en_ca/certificates/', desc: 'Professional certificates in high-demand fields', icon: GraduationCap, tag: 'Paid' },
    { title: 'Khan Academy', url: 'https://www.khanacademy.org', desc: 'Free educational resources and courses', icon: BookOpen, tag: 'Free' },
    { title: 'Codecademy', url: 'https://www.codecademy.com', desc: 'Learn to code for free', icon: BookOpen, tag: 'Free/Paid' },
    { title: 'Alberta Learning Info', url: 'https://alis.alberta.ca/plan-your-education/', desc: 'Education planning resources for Alberta', icon: GraduationCap, tag: 'Free' },
  ],
  career_planning: [
    { title: 'ALIS Explore Careers', url: 'https://alis.alberta.ca/explore-careers/', desc: '500+ occupational profiles with wage and outlook data', icon: Briefcase },
    { title: 'Career Quizzes (ALIS)', url: 'https://alis.alberta.ca/explore-careers/know-yourself/', desc: 'Discover careers that match your interests', icon: Target },
    { title: 'NOC System', url: 'https://noc.esdc.gc.ca/', desc: 'National Occupational Classification system', icon: Globe },
    { title: 'Labour Market Info', url: 'https://www.jobbank.gc.ca/trend-analysis', desc: 'Job trends, wages, and employment outlooks', icon: Target },
  ],
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Resources() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Resources & Training</h1>
        <p className="text-muted-foreground mt-1">Everything you need to succeed in your job search</p>
      </div>

      <Tabs defaultValue="job_search">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="job_search">Job Search</TabsTrigger>
          <TabsTrigger value="interview">Interviews</TabsTrigger>
          <TabsTrigger value="resume_writing">Resumes</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="career_planning">Career Planning</TabsTrigger>
        </TabsList>

        {Object.entries(resources).map(([key, items]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((resource, idx) => (
                <motion.div key={idx} variants={item}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <Card className="h-full hover:shadow-md transition-all hover:border-primary/20 cursor-pointer group">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                          <resource.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{resource.title}</h3>
                            {resource.tag && <Badge variant="secondary" className="text-xs">{resource.tag}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{resource.desc}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
                      </CardContent>
                    </Card>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}