import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Download, User, Award, CheckCircle2, BookOpen, GraduationCap, FileCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ConvocationDialog from '@/components/academic/ConvocationDialog';

const StudentDashboard: React.FC = () => {
  const [isConvocationOpen, setIsConvocationOpen] = useState(false);

  const studentData = {
    name: 'Zaitouni Nourelislam',
    cne: 'D135678942',
    filiere: 'SMI - Sciences Mathématiques et Informatique',
    projectTitle: 'Système Intelligente de Gestion des Soutenances et des Jurys',
    date: '15 Juin 2025',
    time: '09:30 AM',
    room: 'B-204 (Labo Info)',
    jury: [
      { role: 'Président', name: 'Pr. Ahmed Alami' },
      { role: 'Rapporteur', name: 'Dr. Sarah Mansouri' },
      { role: 'Examinateur', name: 'Dr. Karim Benali' },
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold">Bienvenue dans votre espace</h1>
          <p className="text-muted-foreground font-sans">Suivez l'état de votre soutenance et téléchargez vos documents.</p>
        </div>
        <Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all" onClick={() => setIsConvocationOpen(true)}>
          <Download className="h-4 w-4" />
          Ma Convocation Officielle
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-primary/20 bg-primary/[0.02] shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <GraduationCap className="h-32 w-32" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-heading">Ma Soutenance</CardTitle>
                  <CardDescription className="font-sans">Session de Printemps 2025</CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1">Statut: Confirmée</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid sm:grid-cols-3 gap-6 relative z-10">
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Date de passage</p>
                    <p className="font-semibold text-lg">{studentData.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Heure précise</p>
                    <p className="font-semibold text-lg">{studentData.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Salle assignée</p>
                    <p className="font-semibold text-lg">{studentData.room}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900 text-slate-50 rounded-2xl shadow-xl space-y-2 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs uppercase font-bold text-slate-400 tracking-[0.2em]">Titre du Projet</p>
                <h3 className="text-xl font-heading font-medium italic">"{studentData.projectTitle}"</h3>
              </div>

              <div>
                <h3 className="font-heading text-xl font-semibold mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Composition du Jury
                </h3>
                <div className="grid sm:grid-cols-3 gap-6">
                  {studentData.jury.map((member) => (
                    <div key={member.role} className="group p-6 rounded-2xl border bg-white hover:border-primary/30 transition-all hover:shadow-md text-center space-y-3">
                      <div className="h-16 w-16 mx-auto rounded-full bg-slate-50 border flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="h-8 w-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{member.role}</p>
                        <p className="font-heading text-lg font-semibold">{member.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl font-heading">Mon Parcours</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                <div className="space-y-8 relative">
                  {[
                    { title: 'Dépôt du Sujet', date: 'Janvier 2025', status: 'done', icon: BookOpen },
                    { title: 'Validation de l\'Encadrant', date: 'Mars 2025', status: 'done', icon: CheckCircle2 },
                    { title: 'Affectation du Jury', date: 'Mai 2025', status: 'done', icon: User },
                    { title: 'Génération de Convocation', date: 'Juin 2025', status: 'done', icon: FileCheck },
                    { title: 'Jour de la Soutenance', date: '15 Juin 2025', status: 'pending', icon: GraduationCap },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-8 group">
                      <div className={`relative z-10 flex items-center justify-center h-8 w-8 rounded-full border-2 bg-white transition-colors ${step.status === 'done' ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-300'}`}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1 space-y-1">
                        <h4 className={`font-semibold ${step.status === 'done' ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</h4>
                        <p className="text-xs text-muted-foreground">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader>
              <CardTitle className="text-lg font-heading">Actions Requises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-sans">
              {[
                { label: 'Uploader le manuscrit final', done: true },
                { label: 'Charger la présentation (PPT)', done: false },
                { label: 'Confirmer la présence', done: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300 animate-pulse" />
                  )}
                  <span className={`text-sm ${item.done ? 'text-slate-600 line-through opacity-70' : 'text-slate-900 font-medium'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
              {!allDone && (
                <Button variant="outline" className="w-full mt-4 text-xs font-bold uppercase tracking-widest py-6 border-dashed">
                  Compléter mes tâches
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl border-none">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                <Award className="h-32 w-32" />
              </div>
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-md">
                <Award className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold">Prêt pour le grand jour ?</h3>
                <p className="text-primary-foreground/90 text-sm mt-3 font-sans leading-relaxed">
                  "L'éducation est l'arme la plus puissante pour changer le monde."
                </p>
                <p className="text-xs mt-4 text-white/60 italic">- Nelson Mandela</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConvocationDialog 
        isOpen={isConvocationOpen} 
        onClose={() => setIsConvocationOpen(false)} 
        studentData={studentData}
      />
    </div>
  );
};

const allDone = false;

export default StudentDashboard;
