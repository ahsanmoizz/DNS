/*
 * Daily mainnet deployments are deliberately disabled. This script is the
 * required future redeployment entry point and will refuse to sign or submit
 * any transaction until an independently audited release explicitly replaces
 * the guard below.
 */
throw new Error("Daily mainnet deployment is hard-disabled. Complete an independent audit and explicitly replace this guard before any mainnet deployment.");
