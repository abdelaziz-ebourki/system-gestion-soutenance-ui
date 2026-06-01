import { useDefenseSchedule } from "@/hooks/use-defense-schedule";
import {
  DndContext,
  DragOverlay,
} from "@dnd-kit/core";
import {
  Wand2,
  Save,
  Send,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";
import JurySidebar from "@/components/coordinator/JurySidebar";
import DefenseCalendar from "@/components/coordinator/DefenseCalendar";
import DraggableJurySlot from "@/components/coordinator/DraggableJurySlot";

export default function DefenseDesigner() {
  const {
    sessions,
    juries,
    rooms,
    allLoading,
    selectedSessionId,
    setSelectedSessionId,
    currentSession,
    days,
    timeSlots,
    searchQuery,
    setSearchQuery,
    selectedRoomId,
    setSelectedRoomId,
    filteredJuries,
    activeJuryId,
    schedule,
    handleDragStart,
    handleDragEnd,
    handleRemove,
    handleSave,
    handleAutoGenerate,
    handlePublish,
    isPublishDialogOpen,
    setIsPublishDialogOpen,
    saveSchedule,
    transitionSession,
  } = useDefenseSchedule();

  if (allLoading) return <Skeleton className="h-[600px] w-full" />;

  if (!sessions?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planificateur de Soutenances</h1>
          <p className="text-muted-foreground">
            Aucune session de soutenance disponible. Créez d'abord une session dans
            {" "}<a href="/coordinator/defense-sessions" className="text-primary underline">Gestion des sessions</a>.
          </p>
        </div>
      </div>
    );
  }

  if (!currentSession) return <Skeleton className="h-[600px] w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planificateur de Soutenances</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Session:</span>
            <Select
              value={selectedSessionId ?? undefined}
              onValueChange={setSelectedSessionId}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Sélectionner une session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleAutoGenerate} isLoading={saveSchedule.isPending}>
            <Wand2 className="size-4" /> Génération Auto
          </Button>
          <Button className="gap-2" onClick={handleSave} isLoading={saveSchedule.isPending}>
            <Save className="size-4" /> Enregistrer
          </Button>
          <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => setIsPublishDialogOpen(true)}>
            <Send className="size-4" /> Publier
          </Button>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-12 gap-6">
          <JurySidebar
            juries={filteredJuries}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <div className="col-span-9">
            <DefenseCalendar
              days={days}
              timeSlots={timeSlots}
              schedule={schedule}
              juries={juries}
              selectedRoomId={selectedRoomId}
              onRemove={handleRemove}
              rooms={rooms}
              onRoomChange={setSelectedRoomId}
            />
          </div>
        </div>

        <DragOverlay>
          {activeJuryId ? (
            <div className="w-64">
              <DraggableJurySlot
                jury={juries.find((j) => j.id === activeJuryId)!}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AlertDialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publier le planning</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action rendra le planning visible pour les étudiants et les enseignants.
              Assurez-vous d'avoir enregistré vos modifications avant de publier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} isLoading={transitionSession.isPending}>
              Publier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
