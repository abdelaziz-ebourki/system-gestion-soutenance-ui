import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";

interface DeleteAlertProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  title?: string;
  description?: string;
  entityName?: string;
  isPending: boolean;
}

export function DeleteAlert({
  isOpen,
  onOpenChange,
  onDelete,
  title = "Confirmation",
  description,
  entityName,
  isPending,
}: DeleteAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="delete-alert">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? (
              <>
                Cette action est irréversible.
                {entityName ? (
                  <> L'élément "{entityName}" sera définitivement supprimé.</>
                ) : null}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            variant="destructive"
            isLoading={isPending}
            data-testid="delete-alert-confirm"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
