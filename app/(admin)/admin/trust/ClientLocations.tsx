"use client";

import { Button, Label, ListBox, Select } from "@heroui/react";
import { MapPin, X } from "lucide-react";
import type { ClientLocation, ClientsData } from "@/lib/dataLoader";
import { LOCATION_PRESETS } from "@/lib/clientLocations";
import LocationMapPicker from "@/components/admin/LocationMapPicker";
import { EmptyState, LoadingState, Panel, SaveButton } from "@/components/admin/ui";

const NONE = "__none__";

interface ClientLocationsProps {
  clients: ClientsData | null;
  pickedId: string;
  onPickClient: (id: string) => void;
  onChange: (id: string, location: ClientLocation | undefined) => void;
  onSave: () => void;
  saving: boolean;
}

/** The world map on the Trust section of the home page: choose a client, then click where it is. */
export default function ClientLocations({ clients, pickedId, onPickClient, onChange, onSave, saving }: ClientLocationsProps) {
  if (!clients) return <LoadingState label="Loading client locations…" />;

  const picked = clients.clients.find((client) => client.id === pickedId);
  const placed = clients.clients.filter((client) => client.location);
  const presetLabel = LOCATION_PRESETS.find((preset) => preset.label === picked?.location?.label)?.label;
  const isCustomSpot = Boolean(picked?.location && !presetLabel);

  return (
    <Panel
      title="Client locations on the world map"
      description="The map in the Trust section of the website. Choose a client, then click the map where it is based, or pick a city."
      actions={<SaveButton saving={saving} onPress={onSave} label="Save locations" />}
    >
      {clients.clients.length === 0 ? (
        <EmptyState>Add clients first, then place them here.</EmptyState>
      ) : (
        <div className="grid items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex flex-col gap-2">
            <LocationMapPicker
              locations={placed.map((client) => client.location as ClientLocation)}
              selected={picked?.location}
              onPick={(location) => picked && onChange(picked.id, { ...location, label: picked.name || "Pinned location" })}
            />
            <p className="text-xs text-muted">Click anywhere on the map to place {picked?.name || "the selected client"}. Lines from Kerala show every placed client.</p>
          </div>

          <div className="flex flex-col gap-4">
            <Select selectedKey={pickedId} onSelectionChange={(key) => onPickClient(String(key))} className="w-full">
              <Label>Client</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {clients.clients.map((client) => (
                    <ListBox.Item key={client.id} id={client.id} textValue={client.name || "Untitled"}>
                      {client.name || "Untitled"}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            {picked && (
              <Select
                selectedKey={presetLabel ?? NONE}
                onSelectionChange={(key) => onChange(picked.id, LOCATION_PRESETS.find((preset) => preset.label === String(key)))}
                className="w-full"
              >
                <Label>Or pick a city</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id={NONE} textValue="Not on the map">
                      {isCustomSpot ? "A spot placed on the map" : "Not on the map"}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    {LOCATION_PRESETS.map((preset) => (
                      <ListBox.Item key={preset.label} id={preset.label} textValue={preset.label}>
                        {preset.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Placed ({placed.length} of {clients.clients.length})
              </p>
              {placed.length === 0 ? (
                <p className="text-sm italic text-muted">None yet.</p>
              ) : (
                <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto pr-1">
                  {placed.map((client) => (
                    <li key={client.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 hover:bg-default">
                      <button type="button" onClick={() => onPickClient(client.id)} className="flex min-w-0 items-center gap-2 text-left text-sm text-foreground">
                        <MapPin size={13} className="shrink-0 text-accent" />
                        <span className="truncate">{client.name || "Untitled"}</span>
                        <span className="shrink-0 truncate text-xs text-muted">{client.location?.label}</span>
                      </button>
                      <Button isIconOnly size="sm" variant="ghost" aria-label={`Remove ${client.name || "client"} from the map`} onPress={() => onChange(client.id, undefined)}>
                        <X size={13} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
