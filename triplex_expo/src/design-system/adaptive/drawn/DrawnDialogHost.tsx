import { useDialogStore } from '../dialogStore';
import { DrawnActionSheet } from './DrawnActionSheet';
import { DrawnAlertDialog } from './DrawnAlertDialog';

/** Renders the drawn alert / action sheet queue. */
export function DrawnDialogHost() {
  const alert = useDialogStore((s) => s.alerts[0]);
  const sheet = useDialogStore((s) => s.sheets[0]);
  const dismissAlert = useDialogStore((s) => s.dismissAlert);
  const dismissSheet = useDialogStore((s) => s.dismissSheet);

  return (
    <>
      {alert ? <DrawnAlertDialog key={alert.id} request={alert} onDismiss={() => dismissAlert(alert.id)} /> : null}
      {sheet ? <DrawnActionSheet key={sheet.id} request={sheet} onDismiss={() => dismissSheet(sheet.id)} /> : null}
    </>
  );
}
