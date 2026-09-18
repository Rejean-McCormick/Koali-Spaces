// Compatibility facade. Process ownership lives in the generic workspace launcher,
// outside the Koali shell/server boundary.
export {
  probeProduct,
  probeHttp,
  processSpecsForProduct,
  productAutostartEnabled,
  startProductProcesses,
  stopChildren,
} from '../../tools/workspace-launcher/manifest-runner.mjs';
