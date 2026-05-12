import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ResumePreview({ data, participant }) {
  const name = participant?.name || 'Your Name';
  const email = participant?.email || '';
  const phone = participant?.phone || '';

  return (
    <Card className="max-w-3xl mx-auto shadow-lg print:shadow-none print:border-none">
      <CardContent className="p-8 sm:p-10" id="resume-preview-content">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-primary">
          <h1 className="text-2xl font-heading font-bold text-foreground">{name}</h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            {email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{email}</span>}
            {phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{phone}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-5">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-primary mb-2">Professional Summary</h2>
            <p className="text-sm leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Objective */}
        {data.objective && (
          <div className="mb-5">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-primary mb-2">Objective</h2>
            <p className="text-sm leading-relaxed">{data.objective}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-primary mb-3">Work Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sm">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {exp.start_date} — {exp.current ? 'Present' : exp.end_date}
                    </p>
                  </div>
                  {exp.bullets?.filter(b => b).length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {exp.bullets.filter(b => b).map((bullet, bIdx) => (
                        <li key={bIdx} className="text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-primary mb-3">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</h3>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {edu.start_year} — {edu.end_year || 'Present'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-primary mb-2">Skills</h2>
            <p className="text-sm">{data.skills.join(' · ')}</p>
          </div>
        )}

        {/* Certifications */}
        {data.certifications?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-primary mb-2">Certifications</h2>
            <div className="space-y-1">
              {data.certifications.map((cert, idx) => (
                <p key={idx} className="text-sm">{cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}{cert.year ? ` (${cert.year})` : ''}</p>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {data.references_available && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground italic text-center">References available upon request</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}