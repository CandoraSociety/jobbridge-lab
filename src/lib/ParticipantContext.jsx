import React, { createContext, useContext, useState, useEffect } from 'react';

const ParticipantContext = createContext(null);

export function ParticipantProvider({ children }) {
  const [participant, setParticipant] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('joblab_participant');
    if (saved) {
      const data = JSON.parse(saved);
      setParticipant(data);
      setIsGuest(data.is_guest || false);
    }
    setLoading(false);
  }, []);

  const login = (participantData) => {
    setParticipant(participantData);
    setIsGuest(participantData.is_guest || false);
    sessionStorage.setItem('joblab_participant', JSON.stringify(participantData));
  };

  const logout = () => {
    setParticipant(null);
    setIsGuest(false);
    sessionStorage.removeItem('joblab_participant');
  };

  return (
    <ParticipantContext.Provider value={{ participant, isGuest, loading, login, logout, setParticipant }}>
      {children}
    </ParticipantContext.Provider>
  );
}

export function useParticipant() {
  const ctx = useContext(ParticipantContext);
  if (!ctx) throw new Error('useParticipant must be used within ParticipantProvider');
  return ctx;
}