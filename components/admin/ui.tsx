"use client";

import type { ReactNode } from "react";
import { Button, Card, Description, Drawer, Input, Label, Modal, Separator, Spinner, Switch, TextArea, TextField } from "@heroui/react";
import { Save } from "lucide-react";

/**
 * The bar at the top of every page: the title and a line of help on the left; on the right, in a fixed
 * order, the visibility switch, then any secondary buttons, then the main button. It stays in view
 * while the page scrolls, so Save is always one click away.
 */
export function PageHeader({
  title,
  description,
  visibility,
  secondary,
  primary,
}: {
  title: string;
  description?: string;
  /** a "show on website" switch */
  visibility?: ReactNode;
  /** buttons like "Add product" */
  secondary?: ReactNode;
  /** the main button, usually Save */
  primary?: ReactNode;
}) {
  return (
    <div className="sticky -top-6 z-20 -mx-6 -mt-6 mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-separator bg-background/90 px-6 py-4 backdrop-blur lg:-top-8 lg:-mx-8 lg:-mt-8 lg:px-8">
      <div className="min-w-0">
        <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {visibility}
        {visibility && (secondary || primary) && <Separator orientation="vertical" className="h-6" />}
        {secondary}
        {primary}
      </div>
    </div>
  );
}

/** A titled card that groups related fields. */
export function Panel({ title, description, actions, children, className = "" }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={`gap-4 ${className}`}>
      {(title || actions) && (
        <Card.Header className="flex-row items-start justify-between gap-3">
          <div>
            {title && <Card.Title>{title}</Card.Title>}
            {description && <Card.Description>{description}</Card.Description>}
          </div>
          {actions}
        </Card.Header>
      )}
      <Card.Content className="flex flex-col gap-4">{children}</Card.Content>
    </Card>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  type?: string;
  className?: string;
  /** Problems the server reported for this field. */
  errors?: string[];
}

export function TextInput({ label, value, onChange, placeholder, description, type = "text", className = "", errors = [] }: TextInputProps) {
  return (
    <TextField className={`w-full ${className}`} value={value} onChange={onChange} type={type} isInvalid={errors.length > 0}>
      <Label>{label}</Label>
      <Input placeholder={placeholder} variant="secondary" />
      {description && errors.length === 0 && <Description>{description}</Description>}
      {errors.map((message, index) => (
        <p key={index} className="text-xs text-danger">
          {message}
        </p>
      ))}
    </TextField>
  );
}

export function TextAreaInput({ label, value, onChange, placeholder, description, rows = 4, className = "", errors = [] }: Omit<TextInputProps, "type"> & { rows?: number }) {
  return (
    <TextField className={`w-full ${className}`} value={value} onChange={onChange} isInvalid={errors.length > 0}>
      <Label>{label}</Label>
      <TextArea placeholder={placeholder} rows={rows} variant="secondary" className="w-full resize-y" />
      {description && errors.length === 0 && <Description>{description}</Description>}
      {errors.map((message, index) => (
        <p key={index} className="text-xs text-danger">
          {message}
        </p>
      ))}
    </TextField>
  );
}

export function ToggleSwitch({ label, description, isSelected, onChange }: { label: string; description?: string; isSelected: boolean; onChange: (value: boolean) => void }) {
  return (
    <Switch className="flex-row items-center gap-3" isSelected={isSelected} onChange={onChange}>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        <Label>{label}</Label>
        {description && <Description>{description}</Description>}
      </Switch.Content>
    </Switch>
  );
}

export function SaveButton({ saving, onPress, label = "Save changes" }: { saving: boolean; onPress: () => void; label?: string }) {
  return (
    <Button onPress={onPress} isDisabled={saving}>
      {saving ? <Spinner size="sm" color="current" /> : <Save size={15} />}
      {label}
    </Button>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-48 items-center justify-center gap-3 text-muted">
      <Spinner size="sm" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-separator px-6 text-center text-sm italic text-muted">{children}</div>;
}

/** "Are you sure?" dialog for deleting things. */
export function ConfirmModal({
  isOpen,
  onOpenChange,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[400px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-muted">{message}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" slot="close">
                Cancel
              </Button>
              <Button
                variant="danger"
                onPress={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
              >
                {confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

/** A panel that slides in from the right to edit one item, with Done at the bottom. */
export function EditDrawer({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Drawer>
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="sm:w-[28rem]">
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>{title}</Drawer.Heading>
              {description && <p className="text-sm text-muted">{description}</p>}
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-4">{children}</Drawer.Body>
            <Drawer.Footer className="justify-between">
              {footer ?? <span />}
              <Button slot="close">Done</Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
