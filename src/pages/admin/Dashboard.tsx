import React from 'react';
import { Shield, Users, DoorOpen, Settings, Database, Activity, Lock, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold">Administration Système</h1>
          <p className="text-muted-foreground">Gérez les utilisateurs, les accès et la configuration globale.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </Button>
          <Button className="gap-2">
            <Lock className="h-4 w-4" />
            Sécurité
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs', value: '1,240', icon: Users, color: 'text-blue-600' },
          { label: 'Salles', value: '24', icon: DoorOpen, color: 'text-green-600' },
          { label: 'Logs Système', value: '450', icon: Database, color: 'text-amber-600' },
          { label: 'Uptime', value: '99.9%', icon: Activity, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-heading">Utilisateurs Récents</CardTitle>
              <CardDescription>Derniers comptes créés ou modifiés.</CardDescription>
            </div>
            <Button variant="ghost" size="sm">Tout voir</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Dernier accès</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Sofiane Melik', role: 'STUDENT', access: 'Il y a 2 min' },
                  { name: 'Pr. Karima Daoud', role: 'TEACHER', access: 'Il y a 1h' },
                  { name: 'Zahra Ben', role: 'COORDINATOR', access: 'Aujourd\'hui' },
                  { name: 'Admin Root', role: 'ADMIN', access: 'En ligne' },
                ].map((user, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{user.access}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm">
                        <Key className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">État des Salles</CardTitle>
            <CardDescription>Occupation et maintenance des salles de soutenance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { room: 'Amphi A', status: 'Opérationnel', load: 100 },
                { room: 'Amphi B', status: 'Opérationnel', load: 80 },
                { room: 'Salle S-12', status: 'En Maintenance', load: 0 },
                { room: 'Labo Info 1', status: 'Opérationnel', load: 45 },
              ].map((room, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${room.status === 'Opérationnel' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="font-medium">{room.room}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{room.status}</span>
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${room.load}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
