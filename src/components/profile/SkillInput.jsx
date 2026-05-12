import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const COMMON_SKILLS = [
  // General workplace
  "Microsoft Office", "Excel", "Word", "PowerPoint", "Outlook", "Google Workspace",
  "Data Entry", "Filing", "Scheduling", "Customer Service", "Cash Handling", "POS Systems",
  "Communication", "Teamwork", "Time Management", "Problem Solving", "Leadership", "Adaptability",
  "Multitasking", "Attention to Detail", "Critical Thinking", "Conflict Resolution",
  // Trades & Labour
  "Forklift Operation", "Warehouse Management", "Inventory Control", "Shipping & Receiving",
  "Heavy Equipment", "Hand Tools", "Power Tools", "Blueprint Reading", "WHMIS", "First Aid",
  "Safety Compliance", "Welding", "Electrical", "Plumbing", "Carpentry", "Painting",
  // Tech
  "JavaScript", "Python", "HTML/CSS", "React", "SQL", "Data Analysis", "Social Media",
  "Graphic Design", "Adobe Photoshop", "Canva", "IT Support", "Networking", "Cybersecurity",
  // Healthcare & Services
  "Patient Care", "Medical Terminology", "CPR", "Food Handling", "Food Safety", "Cooking",
  "Cleaning & Sanitation", "Childcare", "Elder Care", "Personal Support",
  // Sales & Marketing
  "Sales", "Cold Calling", "Account Management", "Marketing", "Content Writing", "SEO",
  "Social Media Marketing", "Event Planning", "Public Speaking", "Negotiation",
  // Finance & Admin
  "Bookkeeping", "QuickBooks", "Accounts Payable", "Accounts Receivable", "Payroll",
  "Administrative Support", "Reception", "Record Keeping", "Project Management",
];

export default function SkillInput({ skills, onAdd }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = COMMON_SKILLS
      .filter(s => s.toLowerCase().includes(q) && !skills.includes(s))
      .slice(0, 7);
    setSuggestions(filtered);
  }, [query, skills]);

  const handleAdd = (skill) => {
    onAdd(skill);
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      // If first suggestion matches well, add it; otherwise add raw input
      if (suggestions.length > 0 && suggestions[0].toLowerCase().startsWith(query.toLowerCase())) {
        handleAdd(suggestions[0]);
      } else {
        handleAdd(query.trim());
      }
    }
    if (e.key === 'Escape') setSuggestions([]);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Type a skill and press Enter (or pick from suggestions)"
      />
      {suggestions.length > 0 && focused && (
        <div
          ref={dropdownRef}
          className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-md shadow-md overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleAdd(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}