import React from 'react';
import { Mail, Phone } from 'lucide-react';

// 8.5 x 11 inches at 96dpi = 816 x 1056px
export default function ResumePreview({ data, participant }) {
  const name = participant?.name || 'Your Name';
  const email = participant?.email || '';
  const phone = participant?.phone || '';

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #resume-page, #resume-page * { visibility: visible !important; }
          #resume-page {
            position: fixed !important;
            top: 0; left: 0;
            width: 8.5in !important;
            min-height: 11in !important;
            margin: 0 !important;
            padding: 0.75in !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page { size: letter; margin: 0; }
        }
      `}</style>

      {/* Page wrapper — centered on screen, fixed 8.5x11 aspect */}
      <div className="flex justify-center py-6 bg-muted/30">
        <div
          id="resume-page"
          className="bg-white shadow-xl border border-border"
          style={{
            width: '816px',       // 8.5in @ 96dpi
            minHeight: '1056px',  // 11in @ 96dpi
            padding: '72px',      // 0.75in margins
            boxSizing: 'border-box',
            fontFamily: 'Arial, sans-serif',
            fontSize: '11pt',
            color: '#111',
            lineHeight: '1.4',
          }}
        >
          <div id="resume-preview-content">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #2563eb' }}>
              <h1 style={{ fontSize: '22pt', fontWeight: 'bold', margin: '0 0 6px 0', color: '#111' }}>{name}</h1>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '10pt', color: '#555', flexWrap: 'wrap' }}>
                {email && <span>✉ {email}</span>}
                {phone && <span>✆ {phone}</span>}
              </div>
            </div>

            {/* Summary */}
            {data.summary && (
              <Section title="Professional Summary">
                <p style={{ margin: 0, fontSize: '10.5pt' }}>{data.summary}</p>
              </Section>
            )}

            {/* Objective */}
            {data.objective && (
              <Section title="Objective">
                <p style={{ margin: 0, fontSize: '10.5pt' }}>{data.objective}</p>
              </Section>
            )}

            {/* Experience */}
            {data.experience?.length > 0 && (
              <Section title="Work Experience">
                {data.experience.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '11pt' }}>{exp.title}</strong>
                        {exp.company && <div style={{ fontSize: '10.5pt', color: '#444' }}>{exp.company}</div>}
                      </div>
                      {(exp.start_date || exp.end_date) && (
                        <span style={{ fontSize: '10pt', color: '#555', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                          {exp.start_date}{exp.start_date && (exp.end_date || exp.current) ? ' — ' : ''}{exp.current ? 'Present' : exp.end_date}
                        </span>
                      )}
                    </div>
                    {exp.bullets?.filter(b => b).length > 0 && (
                      <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '10.5pt' }}>
                        {exp.bullets.filter(b => b).map((bullet, bIdx) => (
                          <li key={bIdx} style={{ marginBottom: '2px' }}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </Section>
            )}

            {/* Education */}
            {data.education?.length > 0 && (
              <Section title="Education">
                {data.education.map((edu, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '11pt' }}>{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</strong>
                      {edu.institution && <div style={{ fontSize: '10.5pt', color: '#444' }}>{edu.institution}</div>}
                    </div>
                    {(edu.start_year || edu.end_year) && (
                      <span style={{ fontSize: '10pt', color: '#555', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                        {edu.start_year}{edu.start_year && edu.end_year ? ' — ' : ''}{edu.end_year}
                      </span>
                    )}
                  </div>
                ))}
              </Section>
            )}

            {/* Skills */}
            {data.skills?.length > 0 && (
              <Section title="Skills">
                <p style={{ margin: 0, fontSize: '10.5pt' }}>{data.skills.join(' · ')}</p>
              </Section>
            )}

            {/* Certifications */}
            {data.certifications?.length > 0 && (
              <Section title="Certifications">
                {data.certifications.map((cert, idx) => (
                  <p key={idx} style={{ margin: '2px 0', fontSize: '10.5pt' }}>
                    {cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}{cert.year ? ` (${cert.year})` : ''}
                  </p>
                ))}
              </Section>
            )}

            {/* References */}
            {data.references_available && (
              <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ddd', textAlign: 'center' }}>
                <em style={{ fontSize: '10pt', color: '#777' }}>References available upon request</em>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <h2 style={{
        fontSize: '10.5pt',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#2563eb',
        borderBottom: '1px solid #d1d5db',
        paddingBottom: '3px',
        marginBottom: '8px',
        marginTop: 0,
      }}>{title}</h2>
      {children}
    </div>
  );
}