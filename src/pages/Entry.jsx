import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { useParticipant } from '@/lib/ParticipantContext';
import { Briefcase, UserPlus, LogIn, UserX, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Entry() {
  const navigate = useNavigate();
  const { login } = useParticipant();
  const [tab, setTab] = useState('signin');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [signinForm, setSigninForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [guestForm, setGuestForm] = useState({ name: '', email: '', phone: '' });

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const participants = await base44.entities.Participant.filter({ email: signinForm.email, is_guest: false });
    if (participants.length === 0) {
      toast.error('No account found with that email. Please register first.');
      setLoading(false);
      return;
    }
    const p = participants[0];
    if (p.password_hash !== signinForm.password) {
      toast.error('Incorrect password.');
      setLoading(false);
      return;
    }
    const updated = await base44.entities.Participant.update(p.id, {
      total_visits: (p.total_visits || 1) + 1,
      last_visit: new Date().toISOString()
    });
    await base44.entities.VisitLog.create({
      participant_id: p.id,
      participant_name: p.name,
      participant_email: p.email,
      is_guest: false,
      visit_date: new Date().toISOString()
    });
    login({ ...p, ...updated, total_visits: (p.total_visits || 1) + 1 });
    toast.success(`Welcome back, ${p.name}!`);
    navigate('/dashboard');
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (registerForm.password.length < 4) {
      toast.error('Password must be at least 4 characters.');
      return;
    }
    setLoading(true);
    const existing = await base44.entities.Participant.filter({ email: registerForm.email, is_guest: false });
    if (existing.length > 0) {
      toast.error('An account with this email already exists. Please sign in.');
      setLoading(false);
      return;
    }
    const p = await base44.entities.Participant.create({
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      password_hash: registerForm.password,
      is_guest: false,
      total_visits: 1,
      last_visit: new Date().toISOString()
    });
    await base44.entities.VisitLog.create({
      participant_id: p.id,
      participant_name: registerForm.name,
      participant_email: registerForm.email,
      is_guest: false,
      visit_date: new Date().toISOString()
    });
    login(p);
    toast.success(`Welcome, ${registerForm.name}! Your account has been created.`);
    navigate('/dashboard');
    setLoading(false);
  };

  const handleGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    const p = await base44.entities.Participant.create({
      name: guestForm.name,
      email: guestForm.email,
      phone: guestForm.phone,
      is_guest: true,
      total_visits: 1,
      last_visit: new Date().toISOString()
    });
    await base44.entities.VisitLog.create({
      participant_id: p.id,
      participant_name: guestForm.name,
      participant_email: guestForm.email,
      is_guest: true,
      visit_date: new Date().toISOString()
    });
    login({ ...p, is_guest: true });
    toast.success(`Welcome, ${guestForm.name}! You're signed in as a guest.`);
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Job Lab</h1>
          <p className="text-muted-foreground mt-2">Your career starts here. Sign in to access tools, resources, and more.</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="signin" className="text-xs sm:text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="text-xs sm:text-sm">Register</TabsTrigger>
                <TabsTrigger value="guest" className="text-xs sm:text-sm">Guest</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" required value={signinForm.email}
                      onChange={e => setSigninForm({ ...signinForm, email: e.target.value })} placeholder="you@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="si-pass">Password</Label>
                    <div className="relative">
                      <Input id="si-pass" type={showPass ? 'text' : 'password'} required value={signinForm.password}
                        onChange={e => setSigninForm({ ...signinForm, password: e.target.value })} placeholder="Enter password" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPass(!showPass)}>
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <LogIn className="w-4 h-4 mr-2" /> Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input required value={registerForm.name}
                      onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" required value={registerForm.email}
                      onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} placeholder="you@email.com" />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input type="tel" required value={registerForm.phone}
                      onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })} placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" required value={registerForm.password}
                      onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} placeholder="Create a password" />
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input type="password" required value={registerForm.confirmPassword}
                      onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} placeholder="Confirm password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <UserPlus className="w-4 h-4 mr-2" /> Create Account
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="guest">
                <CardDescription className="mb-4 text-sm p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <strong>Guest mode:</strong> Your work won't be saved after you log out, but you can email or print documents during your session.
                </CardDescription>
                <form onSubmit={handleGuest} className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input required value={guestForm.name}
                      onChange={e => setGuestForm({ ...guestForm, name: e.target.value })} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" required value={guestForm.email}
                      onChange={e => setGuestForm({ ...guestForm, email: e.target.value })} placeholder="you@email.com" />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input type="tel" required value={guestForm.phone}
                      onChange={e => setGuestForm({ ...guestForm, phone: e.target.value })} placeholder="(555) 123-4567" />
                  </div>
                  <Button type="submit" className="w-full" variant="outline" disabled={loading}>
                    <UserX className="w-4 h-4 mr-2" /> Continue as Guest
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}