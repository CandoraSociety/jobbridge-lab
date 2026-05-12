import React from 'react';
import { Link } from 'react-router-dom';
import { useParticipant } from '@/lib/ParticipantContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, FileText, Route, ClipboardList, BookOpen,
  ExternalLink, TrendingUp, Briefcase, GraduationCap, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const quickLinks = [
  { path: '/job-search', label: 'Search Jobs', desc: 'Find jobs tailored to your skills', icon: Search, color: 'bg-primary/10 text-primary' },
  { path: '/job-tracker', label: 'Track Applications', desc: 'Monitor your job applications', icon: ClipboardList, color: 'bg-chart-2/10 text-chart-2' },
  { path: '/resume-builder', label: 'Build Resume', desc: 'Create a professional resume', icon: FileText, color: 'bg-accent/10 text-accent' },
  { path: '/career-path', label: 'Career Path', desc: 'Map your career trajectory', icon: Route, color: 'bg-chart-4/10 text-chart-4' },
  { path: '/resources', label: 'Resources', desc: 'Training, guides & more', icon: BookOpen, color: 'bg-chart-5/10 text-chart-5' },
  { path: '/profile', label: 'My Profile', desc: 'Update skills & experience', icon: Briefcase, color: 'bg-chart-3/10 text-chart-3' },
];

const externalResources = [
  { label: 'ALIS Alberta', url: 'https://alis.alberta.ca', desc: 'Occupational profiles & career planning', icon: GraduationCap },
  { label: 'Job Bank Canada', url: 'https://www.jobbank.gc.ca', desc: 'Government of Canada job listings', icon: Globe },
  { label: 'Indeed Canada', url: 'https://ca.indeed.com', desc: 'Browse thousands of jobs', icon: Search },
  { label: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs', desc: 'Professional network & jobs', icon: TrendingUp },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { participant, isGuest } = useParticipant();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold">
              Welcome{participant?.name ? `, ${participant.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-muted-foreground mt-1">Here's your career command centre. What would you like to work on today?</p>
          </div>
          {isGuest && (
            <Badge variant="outline" className="border-accent text-accent self-start">
              Guest Session — work not saved
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map(link => (
          <motion.div key={link.path} variants={item}>
            <Link to={link.path}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border-transparent hover:border-primary/20">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${link.color}`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{link.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* External Resources */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-4">Quick Links & Job Sites</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {externalResources.map(res => (
            <a key={res.url} href={res.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-card border hover:shadow-md hover:border-primary/20 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
                <res.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">{res.label}</p>
                <p className="text-xs text-muted-foreground truncate">{res.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Labour Market Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Labour Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="https://alis.alberta.ca/look-for-work/" target="_blank" rel="noopener noreferrer"
              className="p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
              <TrendingUp className="w-5 h-5 text-primary mb-2" />
              <h4 className="text-sm font-semibold">Alberta Job Trends</h4>
              <p className="text-xs text-muted-foreground mt-1">Current labour market conditions</p>
            </a>
            <a href="https://alis.alberta.ca/explore-careers/" target="_blank" rel="noopener noreferrer"
              className="p-4 rounded-xl bg-chart-2/5 hover:bg-chart-2/10 transition-colors">
              <Briefcase className="w-5 h-5 text-chart-2 mb-2" />
              <h4 className="text-sm font-semibold">Occupational Profiles</h4>
              <p className="text-xs text-muted-foreground mt-1">Explore 500+ career profiles on ALIS</p>
            </a>
            <a href="https://www.jobbank.gc.ca/trend-analysis" target="_blank" rel="noopener noreferrer"
              className="p-4 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors">
              <GraduationCap className="w-5 h-5 text-accent mb-2" />
              <h4 className="text-sm font-semibold">Wage & Outlook Data</h4>
              <p className="text-xs text-muted-foreground mt-1">Salary info and job outlooks</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}