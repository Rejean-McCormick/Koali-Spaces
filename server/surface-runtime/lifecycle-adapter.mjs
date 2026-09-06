/**
 * Surface Layer lifecycle boundary.
 * This module deliberately does not execute process-manager commands. It creates
 * a bounded request envelope for a declared external owner/broker.
 */
export function lifecycleRequest({ moduleId, runtimeRef, operation, lifecycleProfileRef, actorRef = null }) {
  if (!moduleId || !runtimeRef || !lifecycleProfileRef) throw new Error('lifecycle request identity is incomplete');
  if (!['start', 'stop', 'restart', 'activate'].includes(operation)) throw new Error('unsupported lifecycle operation');
  return Object.freeze({
    request_kind: 'koali_surface_lifecycle_request',
    module_id: moduleId,
    runtime_ref: runtimeRef,
    operation,
    lifecycle_profile_ref: lifecycleProfileRef,
    actor_ref: actorRef,
    direct_process_control: false,
  });
}

export function directProcessControl() {
  throw new Error('direct lifecycle execution is prohibited in Koali Spaces Surface Layer');
}
