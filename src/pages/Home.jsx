import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, LogIn, UserPlus, Building, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Briefcase className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Job Lab</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your career development platform. Choose your access point below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
              onClick={() => navigate('/onsite')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Onsite Portal</CardTitle>
                <CardDescription>
                  For Jobs Lab visitors at Riverview Crossing Shopping Centre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li>• Access to lab computers</li>
                  <li>• In-person support available</li>
                  <li>• Full feature access</li>
                </ul>
                <Button className="w-full">
                  <LogIn className="w-4 h-4 mr-2" /> Access Onsite Portal
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
              onClick={() => navigate('/public')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Public Portal</CardTitle>
                <CardDescription>
                  For remote access from home or anywhere
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li>• Access from any device</li>
                  <li>• Create your personal account</li>
                  <li>• Track your career progress</li>
                </ul>
                <Button className="w-full" variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" /> Access Public Portal
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}