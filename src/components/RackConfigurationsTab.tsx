import { useState } from 'react';
import { Card, Label, TextInput, Button } from 'flowbite-react';
import { HiTrash, HiSave } from 'react-icons/hi';
import { RackAttributes } from '../types/tco';

interface RackConfigurationsTabProps {
  rackAttributes: RackAttributes;
  setRackAttributes: (attributes: RackAttributes) => void;
}

interface SavedRackConfig extends RackAttributes {
  name?: string;
}

export function RackConfigurationsTab({ rackAttributes, setRackAttributes }: RackConfigurationsTabProps) {
  const [savedConfigs, setSavedConfigs] = useState<SavedRackConfig[]>([]);
  const [configName, setConfigName] = useState('');
  const [editingRack, setEditingRack] = useState<RackAttributes>(rackAttributes);

  const handleSaveConfig = () => {
    if (!configName) return;
    
    const newConfig: SavedRackConfig = {
      ...editingRack,
      name: configName
    };
    
    setSavedConfigs([...savedConfigs, newConfig]);
    setConfigName('');
  };

  const handleLoadConfig = (config: SavedRackConfig) => {
    setEditingRack(config);
    setRackAttributes(config);
  };

  const handleDeleteConfig = (index: number) => {
    setSavedConfigs(savedConfigs.filter((_, i) => i !== index));
  };

  const handleUpdateCurrentRack = (updates: Partial<RackAttributes>) => {
    const updatedRack = { ...editingRack, ...updates };
    setEditingRack(updatedRack);
    setRackAttributes(updatedRack);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <Card className="dark:bg-gray-800 mb-4">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Current Rack Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="drives-per-server">Drives per Server</Label>
              <TextInput
                id="drives-per-server"
                type="number"
                value={editingRack.drivesPerServer}
                onChange={(e) => handleUpdateCurrentRack({ drivesPerServer: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="drives-per-jbod">Drives per JBOD</Label>
              <TextInput
                id="drives-per-jbod"
                type="number"
                value={editingRack.drivesPerJBOD}
                onChange={(e) => handleUpdateCurrentRack({ drivesPerJBOD: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="servers-per-rack">Servers per Rack</Label>
              <TextInput
                id="servers-per-rack"
                type="number"
                value={editingRack.serversPerRack}
                onChange={(e) => handleUpdateCurrentRack({ serversPerRack: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="jbods-per-rack">JBODs per Rack</Label>
              <TextInput
                id="jbods-per-rack"
                type="number"
                value={editingRack.jbodsPerRack}
                onChange={(e) => handleUpdateCurrentRack({ jbodsPerRack: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="server-power">Server Power (W)</Label>
              <TextInput
                id="server-power"
                type="number"
                value={editingRack.serverPower}
                onChange={(e) => handleUpdateCurrentRack({ serverPower: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="jbod-power">JBOD Power (W)</Label>
              <TextInput
                id="jbod-power"
                type="number"
                value={editingRack.jbodPower}
                onChange={(e) => handleUpdateCurrentRack({ jbodPower: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="server-cost">Server Cost ($)</Label>
              <TextInput
                id="server-cost"
                type="number"
                value={editingRack.serverCost}
                onChange={(e) => handleUpdateCurrentRack({ serverCost: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="jbod-cost">JBOD Cost ($)</Label>
              <TextInput
                id="jbod-cost"
                type="number"
                value={editingRack.jbodCost}
                onChange={(e) => handleUpdateCurrentRack({ jbodCost: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="rack-cost">Rack Cost ($)</Label>
              <TextInput
                id="rack-cost"
                type="number"
                value={editingRack.rackCost}
                onChange={(e) => handleUpdateCurrentRack({ rackCost: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="dc-cost-per-rack">DC Cost per Rack ($)</Label>
              <TextInput
                id="dc-cost-per-rack"
                type="number"
                value={editingRack.dataCenterCostPerRack}
                onChange={(e) => handleUpdateCurrentRack({ dataCenterCostPerRack: Number(e.target.value) })}
              />
            </div>
          </div>
        </Card>

        <Card className="dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Save Current Configuration</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="config-name">Configuration Name</Label>
              <TextInput
                id="config-name"
                type="text"
                placeholder="e.g., HDD Rack, SSD Rack"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveConfig}>
                <HiSave className="mr-2 h-5 w-5" />
                Save Configuration
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Card className="dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Saved Configurations</h2>
          <div className="space-y-4">
            {savedConfigs.map((config, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium dark:text-white">{config.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {config.drivesPerServer} drives/server, {config.drivesPerJBOD} drives/JBOD
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button color="light" size="sm" onClick={() => handleLoadConfig(config)}>
                    Load
                  </Button>
                  <Button color="failure" size="sm" onClick={() => handleDeleteConfig(index)}>
                    <HiTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {savedConfigs.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No saved configurations yet
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 